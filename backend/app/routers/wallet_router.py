import secrets
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import User, Wallet, WalletTransaction, Notification
from app.auth.security import get_current_user
from app.schemas.schemas import WalletResponse, AddMoneyRequest, WalletTransactionResponse

router = APIRouter(prefix="/wallet", tags=["Wallet"])

@router.get("", response_model=WalletResponse)
def get_wallet(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=1500.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet

@router.post("/add", response_model=WalletResponse)
def add_money(req: AddMoneyRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    if req.amount > 50000:
        raise HTTPException(status_code=400, detail="Maximum top-up limit per transaction is ₹50,000.")

    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=0.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    wallet.balance += req.amount
    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=req.amount,
        tx_type="CREDIT",
        description=f"Wallet Top-Up via {req.payment_method}",
        reference_id=f"TOP-{secrets.token_hex(6).upper()}"
    )
    db.add(tx)

    notif = Notification(
        user_id=current_user.id,
        title="Wallet Recharged",
        message=f"₹{req.amount:.2f} credited to your wallet. Current Balance: ₹{wallet.balance:.2f}",
        type="payment"
    )
    db.add(notif)
    db.commit()
    db.refresh(wallet)
    return wallet

@router.get("/transactions", response_model=List[WalletTransactionResponse])
def get_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        return []
    return wallet.transactions
