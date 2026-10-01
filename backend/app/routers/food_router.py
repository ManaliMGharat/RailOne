import secrets
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import (
    User, Restaurant, MenuItem, FoodOrder, FoodOrderItem, Wallet, WalletTransaction, Notification
)
from app.auth.security import get_current_user
from app.schemas.schemas import (
    RestaurantResponse, FoodOrderCreateRequest, FoodOrderResponse
)

router = APIRouter(prefix="/food", tags=["Food Ordering"])

@router.get("/restaurants", response_model=List[RestaurantResponse])
def get_restaurants(
    station: Optional[str] = Query(None, description="Station code filter"),
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant).filter(Restaurant.active == True)
    if station:
        query = query.filter(Restaurant.station_code == station.strip().upper())
    return query.all()

@router.get("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant_detail(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")
    return restaurant

@router.post("/orders", response_model=FoodOrderResponse)
def place_food_order(
    req: FoodOrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.train_number or not req.train_number.strip():
        raise HTTPException(status_code=400, detail="Train number is required for on-seat delivery.")
    if not req.delivery_station or not req.delivery_station.strip():
        raise HTTPException(status_code=400, detail="Delivery station is required.")
    if not req.coach_berth or not req.coach_berth.strip():
        raise HTTPException(status_code=400, detail="Coach and berth details (e.g. B2 - 34) are required.")

    restaurant = db.query(Restaurant).filter(Restaurant.id == req.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")

    if not req.items:
        raise HTTPException(status_code=400, detail="Order must include at least one item.")

    # Duplicate prevention (BUG_011): prevent double debit within 10 seconds
    recent_order = db.query(FoodOrder).filter(
        FoodOrder.user_id == current_user.id,
        FoodOrder.restaurant_id == restaurant.id,
        FoodOrder.train_number == req.train_number.strip(),
        FoodOrder.coach_berth == req.coach_berth.strip()
    ).order_by(FoodOrder.created_at.desc()).first()

    if recent_order and recent_order.created_at:
        order_time = recent_order.created_at.replace(tzinfo=timezone.utc) if recent_order.created_at.tzinfo is None else recent_order.created_at
        now_time = datetime.now(timezone.utc)
        if (now_time - order_time).total_seconds() < 10:
            raise HTTPException(status_code=400, detail="Duplicate order detected. Please wait a few moments before placing another order.")

    # Calculate authoritative total and verify items
    total_amount = 0.0
    items_to_create = []
    for item_input in req.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_input.menu_item_id).first()
        if not menu_item or not menu_item.available:
            raise HTTPException(status_code=400, detail=f"Menu item '{item_input.menu_item_id}' is currently unavailable.")
        subtotal = menu_item.price * item_input.quantity
        total_amount += subtotal
        items_to_create.append((menu_item.name, item_input.quantity, menu_item.price, menu_item.id))

    # Verify wallet balance
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet or wallet.balance < total_amount:
        avail = wallet.balance if wallet else 0.0
        raise HTTPException(status_code=400, detail=f"Insufficient wallet balance (₹{avail:.2f}). Required: ₹{total_amount:.2f}.")

    # Atomic financial and order execution (BUG_011: single transaction with rollback)
    try:
        order_code = f"RO-FOOD-{secrets.token_hex(6).upper()}"
        food_order = FoodOrder(
            order_id=order_code,
            user_id=current_user.id,
            restaurant_id=restaurant.id,
            train_number=req.train_number.strip(),
            pnr_number=req.pnr_number.strip() if req.pnr_number else None,
            delivery_station=req.delivery_station.strip(),
            coach_berth=req.coach_berth.strip(),
            total_amount=total_amount,
            status="Preparing"
        )
        db.add(food_order)
        db.flush() # Flush to populate food_order.id without committing

        # Create order items
        for item_name, qty, price, m_id in items_to_create:
            order_item = FoodOrderItem(
                order_id=food_order.id,
                menu_item_id=m_id,
                item_name=item_name,
                quantity=qty,
                price=price
            )
            db.add(order_item)

        # Debit wallet atomically
        wallet.balance -= total_amount
        tx = WalletTransaction(
            wallet_id=wallet.id,
            amount=total_amount,
            tx_type="DEBIT",
            description=f"Food Order at {restaurant.name} (Train {req.train_number})",
            reference_id=f"FO-{secrets.token_hex(6).upper()}"
        )
        db.add(tx)

        # Create user notification
        notif = Notification(
            user_id=current_user.id,
            title="Food Order Placed!",
            message=f"Order from {restaurant.name} for Train {req.train_number} ({req.coach_berth}) is being prepared.",
            type="booking"
        )
        db.add(notif)

        # Commit everything in a single atomic database transaction
        db.commit()
        db.refresh(food_order)
        return food_order
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Order processing failed: {str(e)}")

@router.get("/orders", response_model=List[FoodOrderResponse])
def get_user_food_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(FoodOrder).filter(FoodOrder.user_id == current_user.id).order_by(FoodOrder.created_at.desc()).all()
