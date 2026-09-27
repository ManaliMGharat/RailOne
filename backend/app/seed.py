import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from datetime import datetime, timezone
from app.database import SessionLocal, engine, Base
from app.models.all_models import (
    User, Station, Train, TrainRoute, TrainClass, Booking, Ticket,
    PNRRecord, PlatformTicket, SeasonTicket, Payment, Wallet,
    WalletTransaction, Notification, Restaurant, MenuItem, SupportTicket
)
from app.auth.security import hash_password, hash_mpin

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Check if already seeded
    existing_stations = db.query(Station).count()
    if existing_stations >= 150:
        print(f"Database already contains {existing_stations} stations. Ensuring admin & demo users exist...")
    else:
        print("Seeding full authoritative stations...")

        # -------------------------------------------------------------
        # STATIONS LIST (160+ official stations with codes, cities, zones)
        # -------------------------------------------------------------
        stations_data = [
            # === MUMBAI SUBURBAN: WESTERN LINE (South to North) ===
            ("CCG", "Churchgate", "Mumbai", "Maharashtra", "WR", 18.9352, 72.8272, "Suburban", "Western", 1),
            ("MEL", "Marine Lines", "Mumbai", "Maharashtra", "WR", 18.9438, 72.8248, "Suburban", "Western", 2),
            ("CYR", "Charni Road", "Mumbai", "Maharashtra", "WR", 18.9519, 72.8188, "Suburban", "Western", 3),
            ("GTR", "Grant Road", "Mumbai", "Maharashtra", "WR", 18.9632, 72.8165, "Suburban", "Western", 4),
            ("MMCT", "Mumbai Central", "Mumbai", "Maharashtra", "WR", 18.9712, 72.8197, "Terminus", "Western", 5),
            ("MX", "Mahalaxmi", "Mumbai", "Maharashtra", "WR", 18.9827, 72.8239, "Suburban", "Western", 6),
            ("PL", "Lower Parel", "Mumbai", "Maharashtra", "WR", 18.9953, 72.8302, "Suburban", "Western", 7),
            ("PBHD", "Prabhadevi", "Mumbai", "Maharashtra", "WR", 19.0065, 72.8335, "Suburban", "Western", 8),
            ("DDR", "Dadar Western", "Mumbai", "Maharashtra", "WR", 19.0178, 72.8432, "Junction", "Western", 9),
            ("MRU", "Matunga Road", "Mumbai", "Maharashtra", "WR", 19.0289, 72.8462, "Suburban", "Western", 10),
            ("MM", "Mahim Junction", "Mumbai", "Maharashtra", "WR", 19.0408, 72.8447, "Junction", "Western", 11),
            ("BA", "Bandra", "Mumbai", "Maharashtra", "WR", 19.0544, 72.8406, "Terminus", "Western", 12),
            ("KHAR", "Khar Road", "Mumbai", "Maharashtra", "WR", 19.0697, 72.8392, "Suburban", "Western", 13),
            ("STC", "Santacruz", "Mumbai", "Maharashtra", "WR", 19.0817, 72.8417, "Suburban", "Western", 14),
            ("VLP", "Vile Parle", "Mumbai", "Maharashtra", "WR", 19.0988, 72.8439, "Suburban", "Western", 15),
            ("ADH", "Andheri", "Mumbai", "Maharashtra", "WR", 19.1197, 72.8464, "Junction", "Western", 16),
            ("JOS", "Jogeshwari", "Mumbai", "Maharashtra", "WR", 19.1360, 72.8490, "Suburban", "Western", 17),
            ("RMAR", "Ram Mandir", "Mumbai", "Maharashtra", "WR", 19.1510, 72.8495, "Suburban", "Western", 18),
            ("GMN", "Goregaon", "Mumbai", "Maharashtra", "WR", 19.1645, 72.8490, "Suburban", "Western", 19),
            ("MDD", "Malad", "Mumbai", "Maharashtra", "WR", 19.1865, 72.8485, "Suburban", "Western", 20),
            ("KILE", "Kandivali", "Mumbai", "Maharashtra", "WR", 19.2045, 72.8522, "Suburban", "Western", 21),
            ("BVI", "Borivali", "Mumbai", "Maharashtra", "WR", 19.2290, 72.8574, "Terminus", "Western", 22),
            ("DIC", "Dahisar", "Mumbai", "Maharashtra", "WR", 19.2505, 72.8592, "Suburban", "Western", 23),
            ("MIRA", "Mira Road", "Thane", "Maharashtra", "WR", 19.2812, 72.8561, "Suburban", "Western", 24),
            ("BYR", "Bhayandar", "Thane", "Maharashtra", "WR", 19.3080, 72.8517, "Suburban", "Western", 25),
            ("NIG", "Naigaon", "Palghar", "Maharashtra", "WR", 19.3523, 72.8471, "Suburban", "Western", 26),
            ("BSR", "Vasai Road", "Palghar", "Maharashtra", "WR", 19.3813, 72.8397, "Junction", "Western", 27),
            ("NSP", "Nallasopara", "Palghar", "Maharashtra", "WR", 19.4172, 72.8258, "Suburban", "Western", 28),
            ("VR", "Virar", "Palghar", "Maharashtra", "WR", 19.4533, 72.8114, "Terminus", "Western", 29),
            ("VTN", "Vaitarna", "Palghar", "Maharashtra", "WR", 19.5210, 72.8250, "Suburban", "Western", 30),
            ("SAH", "Saphale", "Palghar", "Maharashtra", "WR", 19.5760, 72.8210, "Suburban", "Western", 31),
            ("KLV", "Kelve Road", "Palghar", "Maharashtra", "WR", 19.6230, 72.7980, "Suburban", "Western", 32),
            ("PLG", "Palghar", "Palghar", "Maharashtra", "WR", 19.6970, 72.7660, "Suburban", "Western", 33),
            ("BOR", "Boisar", "Palghar", "Maharashtra", "WR", 19.8010, 72.7560, "Suburban", "Western", 34),
            ("VGN", "Vangaon", "Palghar", "Maharashtra", "WR", 19.8920, 72.7510, "Suburban", "Western", 35),
            ("DRD", "Dahanu Road", "Palghar", "Maharashtra", "WR", 19.9730, 72.7320, "Terminus", "Western", 36),

            # === MUMBAI SUBURBAN: CENTRAL MAIN LINE (CSMT to Kalyan/Karjat/Kasara) ===
            ("CSMT", "Chhatrapati Shivaji Maharaj Terminus", "Mumbai", "Maharashtra", "CR", 18.9402, 72.8358, "Terminus", "Central", 1),
            ("MSD", "Masjid", "Mumbai", "Maharashtra", "CR", 18.9525, 72.8385, "Suburban", "Central", 2),
            ("SNRD", "Sandhurst Road", "Mumbai", "Maharashtra", "CR", 18.9610, 72.8398, "Junction", "Central", 3),
            ("BY", "Byculla", "Mumbai", "Maharashtra", "CR", 18.9774, 72.8347, "Suburban", "Central", 4),
            ("CHG", "Chinchpokli", "Mumbai", "Maharashtra", "CR", 18.9880, 72.8339, "Suburban", "Central", 5),
            ("CRD", "Currey Road", "Mumbai", "Maharashtra", "CR", 18.9950, 72.8330, "Suburban", "Central", 6),
            ("PR", "Parel", "Mumbai", "Maharashtra", "CR", 19.0060, 72.8380, "Suburban", "Central", 7),
            ("DR", "Dadar Central", "Mumbai", "Maharashtra", "CR", 19.0178, 72.8432, "Junction", "Central", 8),
            ("MTN", "Matunga", "Mumbai", "Maharashtra", "CR", 19.0270, 72.8550, "Suburban", "Central", 9),
            ("SIN", "Sion", "Mumbai", "Maharashtra", "CR", 19.0400, 72.8630, "Suburban", "Central", 10),
            ("CLA", "Kurla Junction", "Mumbai", "Maharashtra", "CR", 19.0655, 72.8795, "Junction", "Central", 11),
            ("VVH", "Vidyavihar", "Mumbai", "Maharashtra", "CR", 19.0790, 72.8960, "Suburban", "Central", 12),
            ("GC", "Ghatkopar", "Mumbai", "Maharashtra", "CR", 19.0860, 72.9080, "Suburban", "Central", 13),
            ("VK", "Vikhroli", "Mumbai", "Maharashtra", "CR", 19.1110, 72.9290, "Suburban", "Central", 14),
            ("KJMG", "Kanjurmarg", "Mumbai", "Maharashtra", "CR", 19.1260, 72.9370, "Suburban", "Central", 15),
            ("BND", "Bhandup", "Mumbai", "Maharashtra", "CR", 19.1430, 72.9370, "Suburban", "Central", 16),
            ("NHU", "Nahur", "Mumbai", "Maharashtra", "CR", 19.1550, 72.9460, "Suburban", "Central", 17),
            ("MLND", "Mulund", "Mumbai", "Maharashtra", "CR", 19.1720, 72.9560, "Suburban", "Central", 18),
            ("TNA", "Thane", "Thane", "Maharashtra", "CR", 19.1860, 72.9760, "Junction", "Central", 19),
            ("KLVA", "Kalva", "Thane", "Maharashtra", "CR", 19.2010, 72.9970, "Suburban", "Central", 20),
            ("MBQ", "Mumbra", "Thane", "Maharashtra", "CR", 19.1910, 73.0230, "Suburban", "Central", 21),
            ("DIVA", "Diva Junction", "Thane", "Maharashtra", "CR", 19.1890, 73.0440, "Junction", "Central", 22),
            ("KOPR", "Kopar", "Thane", "Maharashtra", "CR", 19.2130, 73.0780, "Suburban", "Central", 23),
            ("DI", "Dombivli", "Thane", "Maharashtra", "CR", 19.2180, 73.0870, "Suburban", "Central", 24),
            ("THK", "Thakurli", "Thane", "Maharashtra", "CR", 19.2270, 73.1070, "Suburban", "Central", 25),
            ("KYN", "Kalyan Junction", "Thane", "Maharashtra", "CR", 19.2360, 73.1310, "Junction", "Central", 26),
            ("VLDI", "Vithalwadi", "Thane", "Maharashtra", "CR", 19.2280, 73.1490, "Suburban", "Central", 27),
            ("ULNR", "Ulhasnagar", "Thane", "Maharashtra", "CR", 19.2180, 73.1590, "Suburban", "Central", 28),
            ("ABH", "Ambernath", "Thane", "Maharashtra", "CR", 19.2060, 73.1870, "Suburban", "Central", 29),
            ("BUD", "Badlapur", "Thane", "Maharashtra", "CR", 19.1630, 73.2380, "Suburban", "Central", 30),
            ("VGI", "Vangani", "Thane", "Maharashtra", "CR", 19.1120, 73.2840, "Suburban", "Central", 31),
            ("SHLU", "Shelu", "Raigad", "Maharashtra", "CR", 19.0680, 73.3150, "Suburban", "Central", 32),
            ("NRL", "Neral Junction", "Raigad", "Maharashtra", "CR", 19.0300, 73.3210, "Junction", "Central", 33),
            ("BVS", "Bhivpuri Road", "Raigad", "Maharashtra", "CR", 18.9660, 73.3280, "Suburban", "Central", 34),
            ("KJT", "Karjat Junction", "Raigad", "Maharashtra", "CR", 18.9100, 73.3280, "Junction", "Central", 35),
            ("KHPI", "Khopoli", "Raigad", "Maharashtra", "CR", 18.7880, 73.3440, "Terminus", "Central", 36),
            ("SHAD", "Shahad", "Thane", "Maharashtra", "CR", 19.2550, 73.1550, "Suburban", "Central", 37),
            ("ABY", "Ambivli", "Thane", "Maharashtra", "CR", 19.2810, 73.1660, "Suburban", "Central", 38),
            ("TLA", "Titwala", "Thane", "Maharashtra", "CR", 19.3020, 73.2080, "Suburban", "Central", 39),
            ("KDV", "Khadavli", "Thane", "Maharashtra", "CR", 19.3780, 73.2390, "Suburban", "Central", 40),
            ("VSD", "Vasind", "Thane", "Maharashtra", "CR", 19.4120, 73.2720, "Suburban", "Central", 41),
            ("ASO", "Asangaon", "Thane", "Maharashtra", "CR", 19.4410, 73.3110, "Suburban", "Central", 42),
            ("ATG", "Atgaon", "Thane", "Maharashtra", "CR", 19.4980, 73.3520, "Suburban", "Central", 43),
            ("THS", "Thansit", "Thane", "Maharashtra", "CR", 19.5540, 73.3980, "Suburban", "Central", 44),
            ("KE", "Khardi", "Thane", "Maharashtra", "CR", 19.5930, 73.4420, "Suburban", "Central", 45),
            ("UBR", "Umbermali", "Thane", "Maharashtra", "CR", 19.6420, 73.4880, "Suburban", "Central", 46),
            ("KSRA", "Kasara", "Thane", "Maharashtra", "CR", 19.6540, 73.4850, "Terminus", "Central", 47),

            # === MUMBAI SUBURBAN: HARBOUR & TRANS-HARBOUR LINE ===
            ("DKRD", "Dockyard Road", "Mumbai", "Maharashtra", "CR", 18.9660, 72.8420, "Suburban", "Harbour", 3),
            ("RRD", "Reay Road", "Mumbai", "Maharashtra", "CR", 18.9760, 72.8440, "Suburban", "Harbour", 4),
            ("CTGN", "Cotton Green", "Mumbai", "Maharashtra", "CR", 18.9860, 72.8470, "Suburban", "Harbour", 5),
            ("SVE", "Sewri", "Mumbai", "Maharashtra", "CR", 18.9980, 72.8540, "Suburban", "Harbour", 6),
            ("VDLR", "Vadala Road", "Mumbai", "Maharashtra", "CR", 19.0160, 72.8590, "Junction", "Harbour", 7),
            ("KCE", "King's Circle", "Mumbai", "Maharashtra", "CR", 19.0290, 72.8580, "Suburban", "Harbour", 8),
            ("GTBN", "Guru Tegh Bahadur Nagar", "Mumbai", "Maharashtra", "CR", 19.0370, 72.8660, "Suburban", "Harbour", 9),
            ("CHF", "Chunabhatti", "Mumbai", "Maharashtra", "CR", 19.0520, 72.8730, "Suburban", "Harbour", 10),
            ("TKNG", "Tilak Nagar", "Mumbai", "Maharashtra", "CR", 19.0690, 72.8940, "Suburban", "Harbour", 12),
            ("CMBR", "Chembur", "Mumbai", "Maharashtra", "CR", 19.0620, 72.9020, "Suburban", "Harbour", 13),
            ("GV", "Govandi", "Mumbai", "Maharashtra", "CR", 19.0550, 72.9150, "Suburban", "Harbour", 14),
            ("MNKD", "Mankhurd", "Mumbai", "Maharashtra", "CR", 19.0490, 72.9320, "Suburban", "Harbour", 15),
            ("VSH", "Vashi", "Navi Mumbai", "Maharashtra", "CR", 19.0630, 72.9980, "Terminus", "Harbour", 16),
            ("SNCR", "Sanpada", "Navi Mumbai", "Maharashtra", "CR", 19.0660, 73.0120, "Suburban", "Harbour", 17),
            ("JNJ", "Juinagar", "Navi Mumbai", "Maharashtra", "CR", 19.0570, 73.0220, "Suburban", "Harbour", 18),
            ("NEU", "Nerul", "Navi Mumbai", "Maharashtra", "CR", 19.0340, 73.0180, "Junction", "Nerul-Uran", 19),
            ("SWDV", "Seawoods-Darave", "Navi Mumbai", "Maharashtra", "CR", 19.0220, 73.0190, "Suburban", "Nerul-Uran", 20),
            ("BEPR", "CBD Belapur", "Navi Mumbai", "Maharashtra", "CR", 19.0180, 73.0390, "Terminus", "Harbour", 21),
            ("KHAG", "Kharghar", "Navi Mumbai", "Maharashtra", "CR", 19.0260, 73.0640, "Suburban", "Harbour", 22),
            ("MANR", "Mansarovar", "Navi Mumbai", "Maharashtra", "CR", 19.0140, 73.0900, "Suburban", "Harbour", 23),
            ("KNDS", "Khandeshwar", "Navi Mumbai", "Maharashtra", "CR", 18.9980, 73.1070, "Suburban", "Harbour", 24),
            ("PNVL", "Panvel Junction", "Navi Mumbai", "Maharashtra", "CR", 18.9890, 73.1220, "Terminus", "Harbour", 25),

            # Trans-Harbour Line
            ("DIGH", "Digha Gaon", "Navi Mumbai", "Maharashtra", "CR", 19.1760, 72.9880, "Suburban", "Trans-Harbour", 2),
            ("AIRL", "Airoli", "Navi Mumbai", "Maharashtra", "CR", 19.1580, 72.9980, "Suburban", "Trans-Harbour", 3),
            ("RABE", "Rabale", "Navi Mumbai", "Maharashtra", "CR", 19.1380, 73.0080, "Suburban", "Trans-Harbour", 4),
            ("GNSL", "Ghansoli", "Navi Mumbai", "Maharashtra", "CR", 19.1230, 73.0120, "Suburban", "Trans-Harbour", 5),
            ("KPHN", "Koparkhairane", "Navi Mumbai", "Maharashtra", "CR", 19.1020, 73.0140, "Suburban", "Trans-Harbour", 6),
            ("TUH", "Turbhe", "Navi Mumbai", "Maharashtra", "CR", 19.0810, 73.0180, "Suburban", "Trans-Harbour", 7),

            # === NERUL - URAN CORRIDOR (Complete Official Sequence) ===
            # Nerul -> Seawoods -> Sagar Sangam -> Targhar -> Bamandongri -> Kharkopar -> Shematikhar -> Nhava Sheva -> Dronagiri -> Uran + Gavan + Ranjanpada
            ("SGSM", "Sagar Sangam", "Navi Mumbai", "Maharashtra", "CR", 19.0080, 73.0150, "Suburban", "Nerul-Uran", 21),
            ("TRGR", "Targhar", "Navi Mumbai", "Maharashtra", "CR", 18.9880, 73.0120, "Suburban", "Nerul-Uran", 22),
            ("BMDR", "Bamandongri", "Navi Mumbai", "Maharashtra", "CR", 18.9720, 73.0080, "Suburban", "Nerul-Uran", 23),
            ("KARP", "Kharkopar", "Navi Mumbai", "Maharashtra", "CR", 18.9560, 73.0010, "Suburban", "Nerul-Uran", 24),
            ("GAVN", "Gavan", "Navi Mumbai", "Maharashtra", "CR", 18.9410, 72.9960, "Suburban", "Nerul-Uran", 25),
            ("RJNP", "Ranjanpada", "Navi Mumbai", "Maharashtra", "CR", 18.9280, 72.9890, "Suburban", "Nerul-Uran", 26),
            ("SMKR", "Shematikhar", "Navi Mumbai", "Maharashtra", "CR", 18.9180, 72.9810, "Suburban", "Nerul-Uran", 27),
            ("NUSH", "Nhava Sheva", "Navi Mumbai", "Maharashtra", "CR", 18.9010, 72.9690, "Suburban", "Nerul-Uran", 28),
            ("DRGI", "Dronagiri", "Navi Mumbai", "Maharashtra", "CR", 18.8850, 72.9490, "Suburban", "Nerul-Uran", 29),
            ("UNR", "Uran", "Navi Mumbai", "Maharashtra", "CR", 18.8780, 72.9320, "Terminus", "Nerul-Uran", 30),

            # === MAJOR INDIAN RAILWAY STATIONS (National Transit Hubs) ===
            ("PUNE", "Pune Junction", "Pune", "Maharashtra", "CR", 18.5284, 73.8744, "Junction", None, None),
            ("LNL", "Lonavala", "Pune", "Maharashtra", "CR", 18.7516, 73.4072, "Junction", None, None),
            ("KDG", "Khadki", "Pune", "Maharashtra", "CR", 18.5630, 73.8370, "Suburban", None, None),
            ("SVJR", "Shivajinagar", "Pune", "Maharashtra", "CR", 18.5320, 73.8510, "Suburban", None, None),
            ("SUR", "Solapur", "Solapur", "Maharashtra", "CR", 17.6599, 75.9064, "Junction", None, None),
            ("NGP", "Nagpur Junction", "Nagpur", "Maharashtra", "CR", 21.1528, 79.0882, "Junction", None, None),
            ("BSL", "Bhusaval Junction", "Bhusawal", "Maharashtra", "CR", 21.0455, 75.8011, "Junction", None, None),
            ("NK", "Nashik Road", "Nashik", "Maharashtra", "CR", 19.9575, 73.8340, "Junction", None, None),
            ("MMR", "Manmad Junction", "Manmad", "Maharashtra", "CR", 20.2520, 74.4370, "Junction", None, None),
            ("IGP", "Igatpuri", "Nashik", "Maharashtra", "CR", 19.6970, 73.5650, "Junction", None, None),
            ("MAO", "Madgaon Junction", "Goa", "Goa", "KR", 15.2736, 73.9782, "Junction", None, None),
            ("THVM", "Thivim", "Goa", "Goa", "KR", 15.6267, 73.8786, "Regular", None, None),
            ("RN", "Ratnagiri", "Ratnagiri", "Maharashtra", "KR", 16.9830, 73.3370, "Regular", None, None),
            ("ROHA", "Roha", "Raigad", "Maharashtra", "CR", 18.4350, 73.1180, "Junction", None, None),
            
            # Gujarat / Western
            ("ADI", "Ahmedabad Junction", "Ahmedabad", "Gujarat", "WR", 23.0225, 72.5714, "Junction", None, None),
            ("ST", "Surat", "Surat", "Gujarat", "WR", 21.2050, 72.8407, "Junction", None, None),
            ("BRC", "Vadodara Junction", "Vadodara", "Gujarat", "WR", 22.3107, 73.1812, "Junction", None, None),
            ("RJT", "Rajkot Junction", "Rajkot", "Gujarat", "WR", 22.3117, 70.8022, "Junction", None, None),
            ("BVC", "Bhavnagar Terminus", "Bhavnagar", "Gujarat", "WR", 21.7645, 72.1519, "Terminus", None, None),
            ("GIMB", "Gandhidham Junction", "Gandhidham", "Gujarat", "WR", 23.0753, 70.1337, "Junction", None, None),
            ("VAPI", "Vapi", "Vapi", "Gujarat", "WR", 20.3713, 72.9043, "Regular", None, None),
            ("BL", "Valsad", "Valsad", "Gujarat", "WR", 20.6103, 72.9342, "Regular", None, None),
            ("NVS", "Navsari", "Navsari", "Gujarat", "WR", 20.9507, 72.9324, "Regular", None, None),
            ("BH", "Bharuch Junction", "Bharuch", "Gujarat", "WR", 21.7051, 72.9959, "Junction", None, None),
            ("ANND", "Anand Junction", "Anand", "Gujarat", "WR", 22.5645, 72.9289, "Junction", None, None),
            ("ND", "Nadiad Junction", "Nadiad", "Gujarat", "WR", 22.6916, 72.8634, "Junction", None, None),

            # North India
            ("NDLS", "New Delhi", "New Delhi", "Delhi", "NR", 28.6427, 77.2195, "Terminus", None, None),
            ("DLI", "Old Delhi", "New Delhi", "Delhi", "NR", 28.6609, 77.2274, "Terminus", None, None),
            ("NZM", "Hazrat Nizamuddin", "New Delhi", "Delhi", "NR", 28.5888, 77.2534, "Terminus", None, None),
            ("ANVT", "Anand Vihar Terminal", "New Delhi", "Delhi", "NR", 28.6508, 77.3153, "Terminus", None, None),
            ("GZB", "Ghaziabad Junction", "Ghaziabad", "Uttar Pradesh", "NR", 28.6679, 77.4334, "Junction", None, None),
            ("CNB", "Kanpur Central", "Kanpur", "Uttar Pradesh", "NCR", 26.4547, 80.3507, "Junction", None, None),
            ("LKO", "Lucknow Charbagh", "Lucknow", "Uttar Pradesh", "NR", 26.8319, 80.9231, "Junction", None, None),
            ("BSB", "Varanasi Junction", "Varanasi", "Uttar Pradesh", "NR", 25.3283, 82.9866, "Junction", None, None),
            ("PRYJ", "Prayagraj Junction", "Prayagraj", "Uttar Pradesh", "NCR", 25.4484, 81.8340, "Junction", None, None),
            ("AGC", "Agra Cantt", "Agra", "Uttar Pradesh", "NCR", 27.1593, 77.9942, "Junction", None, None),
            ("GWL", "Gwalior Junction", "Gwalior", "Madhya Pradesh", "NCR", 26.2183, 78.1828, "Junction", None, None),
            ("JHS", "Virangana Lakshmibai Jhansi", "Jhansi", "Uttar Pradesh", "NCR", 25.4484, 78.5685, "Junction", None, None),
            ("BPL", "Bhopal Junction", "Bhopal", "Madhya Pradesh", "WCR", 23.2684, 77.4126, "Junction", None, None),
            ("RKMP", "Rani Kamlapati", "Bhopal", "Madhya Pradesh", "WCR", 23.2045, 77.4380, "Terminus", None, None),
            ("INDB", "Indore Junction", "Indore", "Madhya Pradesh", "WR", 22.7179, 75.8682, "Junction", None, None),
            ("UJN", "Ujjain Junction", "Ujjain", "Madhya Pradesh", "WR", 23.1828, 75.7772, "Junction", None, None),
            ("KOTA", "Kota Junction", "Kota", "Rajasthan", "WCR", 25.2138, 75.8648, "Junction", None, None),
            ("JP", "Jaipur Junction", "Jaipur", "Rajasthan", "NWR", 26.9200, 75.7878, "Junction", None, None),
            ("JU", "Jodhpur Junction", "Jodhpur", "Rajasthan", "NWR", 26.2842, 73.0189, "Junction", None, None),
            ("AII", "Ajmer Junction", "Ajmer", "Rajasthan", "NWR", 26.4525, 74.6399, "Junction", None, None),
            ("UDZ", "Udaipur City", "Udaipur", "Rajasthan", "NWR", 24.5713, 73.6980, "Terminus", None, None),
            ("ASR", "Amritsar Junction", "Amritsar", "Punjab", "NR", 31.6340, 74.8723, "Junction", None, None),
            ("CDG", "Chandigarh Junction", "Chandigarh", "Chandigarh", "NR", 30.7046, 76.8246, "Junction", None, None),
            ("UMB", "Ambala Cantt", "Ambala", "Haryana", "NR", 30.3340, 76.8370, "Junction", None, None),
            ("LDH", "Ludhiana Junction", "Ludhiana", "Punjab", "NR", 30.9010, 75.8573, "Junction", None, None),
            ("JAT", "Jammu Tawi", "Jammu", "Jammu & Kashmir", "NR", 32.7060, 74.8780, "Terminus", None, None),
            ("SVDK", "Shri Mata Vaishno Devi Katra", "Katra", "Jammu & Kashmir", "NR", 32.9930, 74.9320, "Terminus", None, None),
            ("DDN", "Dehradun", "Dehradun", "Uttarakhand", "NR", 30.3150, 78.0322, "Terminus", None, None),
            ("HW", "Haridwar", "Haridwar", "Uttarakhand", "NR", 29.9457, 78.1565, "Junction", None, None),

            # East & North East
            ("HWH", "Howrah Junction", "Kolkata", "West Bengal", "ER", 22.5839, 88.3433, "Terminus", None, None),
            ("SDAH", "Sealdah", "Kolkata", "West Bengal", "ER", 22.5697, 88.3713, "Terminus", None, None),
            ("KOAA", "Kolkata Railway Station", "Kolkata", "West Bengal", "ER", 22.6040, 88.3770, "Terminus", None, None),
            ("SHM", "Shalimar", "Howrah", "West Bengal", "SER", 22.5530, 88.3180, "Terminus", None, None),
            ("KGP", "Kharagpur Junction", "Kharagpur", "West Bengal", "SER", 22.3380, 87.3230, "Junction", None, None),
            ("PNBE", "Patna Junction", "Patna", "Bihar", "ECR", 25.6022, 85.1376, "Junction", None, None),
            ("DNR", "Danapur", "Patna", "Bihar", "ECR", 25.6260, 85.0420, "Regular", None, None),
            ("GAYA", "Gaya Junction", "Gaya", "Bihar", "ECR", 24.8050, 85.0060, "Junction", None, None),
            ("RNC", "Ranchi Junction", "Ranchi", "Jharkhand", "SER", 23.3510, 85.3340, "Junction", None, None),
            ("DHN", "Dhanbad Junction", "Dhanbad", "Jharkhand", "ECR", 23.7910, 86.4300, "Junction", None, None),
            ("TATA", "Tatanagar Junction", "Jamshedpur", "Jharkhand", "SER", 22.7660, 86.2020, "Junction", None, None),
            ("BBS", "Bhubaneswar", "Bhubaneswar", "Odisha", "ECoR", 20.2644, 85.8400, "Junction", None, None),
            ("PURI", "Puri", "Puri", "Odisha", "ECoR", 19.8135, 85.8312, "Terminus", None, None),
            ("CTC", "Cuttack Junction", "Cuttack", "Odisha", "ECoR", 20.4630, 85.8940, "Junction", None, None),
            ("GHY", "Guwahati", "Guwahati", "Assam", "NFR", 26.1856, 91.7523, "Junction", None, None),

            # South India
            ("MAS", "Puratchi Thalaivar Dr. M.G.R. Central (Chennai)", "Chennai", "Tamil Nadu", "SR", 13.0827, 80.2707, "Terminus", None, None),
            ("MS", "Chennai Egmore", "Chennai", "Tamil Nadu", "SR", 13.0782, 80.2608, "Terminus", None, None),
            ("CBE", "Coimbatore Junction", "Coimbatore", "Tamil Nadu", "SR", 11.0016, 76.9628, "Junction", None, None),
            ("MDU", "Madurai Junction", "Madurai", "Tamil Nadu", "SR", 9.9195, 78.1110, "Junction", None, None),
            ("SBC", "KSR Bengaluru City Junction", "Bengaluru", "Karnataka", "SWR", 12.9784, 77.5694, "Terminus", None, None),
            ("YPR", "Yesvantpur Junction", "Bengaluru", "Karnataka", "SWR", 13.0238, 77.5503, "Junction", None, None),
            ("SMVB", "Sir M. Visvesvaraya Terminal Bengaluru", "Bengaluru", "Karnataka", "SWR", 13.0030, 77.6530, "Terminus", None, None),
            ("MYS", "Mysuru Junction", "Mysuru", "Karnataka", "SWR", 12.3160, 76.6460, "Junction", None, None),
            ("UBL", "SSS Hubballi Junction", "Hubballi", "Karnataka", "SWR", 15.3520, 75.1480, "Junction", None, None),
            ("HYB", "Hyderabad Deccan (Nampally)", "Hyderabad", "Telangana", "SCR", 17.3920, 78.4690, "Terminus", None, None),
            ("SC", "Secunderabad Junction", "Secunderabad", "Telangana", "SCR", 17.4344, 78.5015, "Junction", None, None),
            ("BMT", "Begumpet", "Hyderabad", "Telangana", "SCR", 17.4420, 78.4630, "Suburban", None, None),
            ("BZA", "Vijayawada Junction", "Vijayawada", "Andhra Pradesh", "SCR", 16.5186, 80.6195, "Junction", None, None),
            ("VSKP", "Visakhapatnam Junction", "Visakhapatnam", "Andhra Pradesh", "ECoR", 17.7215, 83.2870, "Junction", None, None),
            ("TPTY", "Tirupati", "Tirupati", "Andhra Pradesh", "SCR", 13.6288, 79.4192, "Terminus", None, None),
            ("TVC", "Thiruvananthapuram Central", "Thiruvananthapuram", "Kerala", "SR", 8.4875, 76.9525, "Terminus", None, None),
            ("ERS", "Ernakulam Junction (South)", "Kochi", "Kerala", "SR", 9.9678, 76.2890, "Junction", None, None),
            ("ERN", "Ernakulam Town (North)", "Kochi", "Kerala", "SR", 9.9920, 76.2910, "Regular", None, None),
            ("CLT", "Kozhikode (Calicut)", "Kozhikode", "Kerala", "SR", 11.2480, 75.7830, "Junction", None, None),
        ]

        count = 0
        for code, name, city, state, zone, lat, lon, st_type, sub_line, seq in stations_data:
            st = db.query(Station).filter(Station.station_code == code).first()
            if not st:
                st = Station(
                    station_code=code,
                    station_name=name,
                    city=city,
                    state=state,
                    railway_zone=zone,
                    latitude=lat,
                    longitude=lon,
                    station_type=st_type,
                    suburban_line=sub_line,
                    suburban_sequence=seq,
                    active=True
                )
                db.add(st)
                count += 1
        db.commit()
        print(f"Successfully seeded {count} stations! Total in DB: {db.query(Station).count()}")

    # 2. Seed Trains and Routes (including MMCT <-> PUNE scenario and Nerul <-> Uran)
    existing_trains = db.query(Train).count()
    if existing_trains == 0:
        print("Seeding trains, routes, and class availability...")

        trains_spec = [
            # MMCT / CSMT to PUNE (Deccan Queen)
            {
                "number": "12124",
                "name": "Deccan Queen Superfast Express",
                "source": "PUNE",
                "destination": "CSMT",
                "dep": "07:15",
                "arr": "10:25",
                "dur": "3h 10m",
                "days": "MON,TUE,WED,THU,FRI,SAT,SUN",
                "classes": "CC,2S,1A",
                "type": "Superfast",
                "routes": [
                    ("PUNE", "Pune Junction", 1, "07:15", "07:15", 0, 0.0),
                    ("SVJR", "Shivajinagar", 2, "07:20", "07:22", 2, 2.0),
                    ("LNL", "Lonavala", 3, "08:18", "08:20", 2, 63.8),
                    ("KJT", "Karjat Junction", 4, "09:03", "09:05", 2, 91.8),
                    ("KYN", "Kalyan Junction", 5, "09:43", "09:45", 2, 137.5),
                    ("DR", "Dadar Central", 6, "10:13", "10:15", 2, 182.2),
                    ("CSMT", "Chhatrapati Shivaji Maharaj Terminus", 7, "10:25", "10:25", 0, 191.0),
                ],
                "class_fares": [("CC", 385.0), ("2S", 125.0), ("1A", 1250.0)]
            },
            # Reverse Deccan Queen
            {
                "number": "12123",
                "name": "Deccan Queen Superfast Express",
                "source": "CSMT",
                "destination": "PUNE",
                "dep": "17:10",
                "arr": "20:25",
                "dur": "3h 15m",
                "days": "MON,TUE,WED,THU,FRI,SAT,SUN",
                "classes": "CC,2S,1A",
                "type": "Superfast",
                "routes": [
                    ("CSMT", "Chhatrapati Shivaji Maharaj Terminus", 1, "17:10", "17:10", 0, 0.0),
                    ("DR", "Dadar Central", 2, "17:20", "17:22", 2, 8.8),
                    ("KYN", "Kalyan Junction", 3, "17:58", "18:00", 2, 53.5),
                    ("KJT", "Karjat Junction", 4, "18:38", "18:40", 2, 99.2),
                    ("LNL", "Lonavala", 5, "19:28", "19:30", 2, 127.2),
                    ("SVJR", "Shivajinagar", 6, "20:08", "20:10", 2, 189.0),
                    ("PUNE", "Pune Junction", 7, "20:25", "20:25", 0, 191.0),
                ],
                "class_fares": [("CC", 385.0), ("2S", 125.0), ("1A", 1250.0)]
            },
            # Pragati Express (covers MMCT / Dadar to PUNE scenario!)
            {
                "number": "12125",
                "name": "Pragati Express",
                "source": "MMCT",
                "destination": "PUNE",
                "dep": "16:25",
                "arr": "19:50",
                "dur": "3h 25m",
                "days": "MON,TUE,WED,THU,FRI,SAT,SUN",
                "classes": "CC,2S,3A",
                "type": "Express",
                "routes": [
                    ("MMCT", "Mumbai Central", 1, "16:25", "16:25", 0, 0.0),
                    ("DR", "Dadar Central", 2, "16:40", "16:43", 3, 9.0),
                    ("TNA", "Thane", 3, "17:03", "17:05", 2, 33.0),
                    ("PNVL", "Panvel Junction", 4, "17:48", "17:50", 2, 67.0),
                    ("KJT", "Karjat Junction", 5, "18:23", "18:25", 2, 101.0),
                    ("LNL", "Lonavala", 6, "19:08", "19:10", 2, 129.0),
                    ("SVJR", "Shivajinagar", 7, "19:38", "19:40", 2, 187.0),
                    ("PUNE", "Pune Junction", 8, "19:50", "19:50", 0, 192.0),
                ],
                "class_fares": [("CC", 390.0), ("2S", 120.0), ("3A", 540.0)]
            },
            # Reverse Pragati Express
            {
                "number": "12126",
                "name": "Pragati Express",
                "source": "PUNE",
                "destination": "MMCT",
                "dep": "07:50",
                "arr": "11:15",
                "dur": "3h 25m",
                "days": "MON,TUE,WED,THU,FRI,SAT,SUN",
                "classes": "CC,2S,3A",
                "type": "Express",
                "routes": [
                    ("PUNE", "Pune Junction", 1, "07:50", "07:50", 0, 0.0),
                    ("SVJR", "Shivajinagar", 2, "07:58", "08:00", 2, 5.0),
                    ("LNL", "Lonavala", 3, "08:48", "08:50", 2, 63.0),
                    ("KJT", "Karjat Junction", 4, "09:33", "09:35", 2, 91.0),
                    ("PNVL", "Panvel Junction", 5, "10:13", "10:15", 2, 125.0),
                    ("TNA", "Thane", 6, "10:48", "10:50", 2, 159.0),
                    ("DR", "Dadar Central", 7, "11:03", "11:05", 2, 183.0),
                    ("MMCT", "Mumbai Central", 8, "11:15", "11:15", 0, 192.0),
                ],
                "class_fares": [("CC", 390.0), ("2S", 120.0), ("3A", 540.0)]
            },
            # Mumbai Rajdhani (MMCT to NDLS)
            {
                "number": "12951",
                "name": "Mumbai Rajdhani Express",
                "source": "MMCT",
                "destination": "NDLS",
                "dep": "17:00",
                "arr": "08:32",
                "dur": "15h 32m",
                "days": "MON,TUE,WED,THU,FRI,SAT,SUN",
                "classes": "1A,2A,3A",
                "type": "Rajdhani",
                "routes": [
                    ("MMCT", "Mumbai Central", 1, "17:00", "17:00", 0, 0.0),
                    ("BVI", "Borivali", 2, "17:22", "17:24", 2, 29.5),
                    ("ST", "Surat", 3, "19:43", "19:48", 5, 263.0),
                    ("BRC", "Vadodara Junction", 4, "21:06", "21:16", 10, 392.0),
                    ("RTM", "Ratlam Junction", 5, "00:25", "00:28", 3, 653.0),
                    ("KOTA", "Kota Junction", 6, "03:15", "03:20", 5, 920.0),
                    ("NDLS", "New Delhi", 7, "08:32", "08:32", 0, 1386.0),
                ],
                "class_fares": [("1A", 4850.0), ("2A", 3120.0), ("3A", 2250.0)]
            },
            # Nerul to Uran Suburban Corridor (Official Route)
            {
                "number": "99701",
                "name": "Nerul - Uran Suburban Local",
                "source": "NEU",
                "destination": "UNR",
                "dep": "06:40",
                "arr": "07:22",
                "dur": "42m",
                "days": "MON,TUE,WED,THU,FRI,SAT,SUN",
                "classes": "II,FC",
                "type": "Suburban",
                "routes": [
                    ("NEU", "Nerul", 1, "06:40", "06:40", 0, 0.0),
                    ("SWDV", "Seawoods-Darave", 2, "06:44", "06:45", 1, 2.8),
                    ("SGSM", "Sagar Sangam", 3, "06:49", "06:50", 1, 5.5),
                    ("TRGR", "Targhar", 4, "06:54", "06:55", 1, 8.2),
                    ("BMDR", "Bamandongri", 5, "06:59", "07:00", 1, 11.0),
                    ("KARP", "Kharkopar", 6, "07:04", "07:05", 1, 13.8),
                    ("GAVN", "Gavan", 7, "07:09", "07:10", 1, 17.0),
                    ("RJNP", "Ranjanpada", 8, "07:13", "07:14", 1, 20.2),
                    ("NUSH", "Nhava Sheva", 9, "07:16", "07:17", 1, 23.5),
                    ("DRGI", "Dronagiri", 10, "07:19", "07:20", 1, 25.8),
                    ("UNR", "Uran", 11, "07:22", "07:22", 0, 27.5),
                ],
                "class_fares": [("II", 10.0), ("FC", 65.0)]
            },
            # Uran to Nerul Suburban Corridor (Reverse Official Route)
            {
                "number": "99702",
                "name": "Uran - Nerul Suburban Local",
                "source": "UNR",
                "destination": "NEU",
                "dep": "07:35",
                "arr": "08:17",
                "dur": "42m",
                "days": "MON,TUE,WED,THU,FRI,SAT,SUN",
                "classes": "II,FC",
                "type": "Suburban",
                "routes": [
                    ("UNR", "Uran", 1, "07:35", "07:35", 0, 0.0),
                    ("DRGI", "Dronagiri", 2, "07:37", "07:38", 1, 1.7),
                    ("NUSH", "Nhava Sheva", 3, "07:40", "07:41", 1, 4.0),
                    ("RJNP", "Ranjanpada", 4, "07:43", "07:44", 1, 7.3),
                    ("GAVN", "Gavan", 5, "07:47", "07:48", 1, 10.5),
                    ("KARP", "Kharkopar", 6, "07:52", "07:53", 1, 13.7),
                    ("BMDR", "Bamandongri", 7, "07:57", "07:58", 1, 16.5),
                    ("TRGR", "Targhar", 8, "08:02", "08:03", 1, 19.3),
                    ("SGSM", "Sagar Sangam", 9, "08:07", "08:08", 1, 22.0),
                    ("SWDV", "Seawoods-Darave", 10, "08:12", "08:13", 1, 24.7),
                    ("NEU", "Nerul", 11, "08:17", "08:17", 0, 27.5),
                ],
                "class_fares": [("II", 10.0), ("FC", 65.0)]
            },
            # Vande Bharat Express (CSMT to Shirdi / Pune direction)
            {
                "number": "22223",
                "name": "Mumbai CSMT - Sainagar Shirdi Vande Bharat",
                "source": "CSMT",
                "destination": "SNSI",
                "dep": "06:20",
                "arr": "11:40",
                "dur": "5h 20m",
                "days": "MON,TUE,WED,THU,FRI,SUN",
                "classes": "CC,EC",
                "type": "Vande Bharat",
                "routes": [
                    ("CSMT", "Chhatrapati Shivaji Maharaj Terminus", 1, "06:20", "06:20", 0, 0.0),
                    ("DR", "Dadar Central", 2, "06:30", "06:32", 2, 8.8),
                    ("TNA", "Thane", 3, "06:49", "06:51", 2, 33.2),
                    ("KYN", "Kalyan Junction", 4, "07:11", "07:13", 2, 53.5),
                    ("NK", "Nashik Road", 5, "08:57", "08:59", 2, 186.0),
                    ("MMR", "Manmad Junction", 6, "09:45", "09:47", 2, 257.0),
                ],
                "class_fares": [("CC", 975.0), ("EC", 1840.0)]
            },
            # Shatabdi Express (MMCT to ADI)
            {
                "number": "12009",
                "name": "Mumbai Central - Ahmedabad Shatabdi Express",
                "source": "MMCT",
                "destination": "ADI",
                "dep": "06:20",
                "arr": "12:45",
                "dur": "6h 25m",
                "days": "MON,TUE,WED,THU,FRI,SAT",
                "classes": "CC,EC",
                "type": "Shatabdi",
                "routes": [
                    ("MMCT", "Mumbai Central", 1, "06:20", "06:20", 0, 0.0),
                    ("BVI", "Borivali", 2, "06:43", "06:45", 2, 29.5),
                    ("VAPI", "Vapi", 3, "08:03", "08:05", 2, 168.0),
                    ("ST", "Surat", 4, "09:15", "09:18", 3, 263.0),
                    ("BH", "Bharuch Junction", 5, "09:56", "09:58", 2, 322.0),
                    ("BRC", "Vadodara Junction", 6, "10:48", "10:51", 3, 392.0),
                    ("ANND", "Anand Junction", 7, "11:24", "11:26", 2, 427.0),
                    ("ADI", "Ahmedabad Junction", 8, "12:45", "12:45", 0, 491.0),
                ],
                "class_fares": [("CC", 1120.0), ("EC", 2150.0)]
            },
            # Konark Express (CSMT to BBS)
            {
                "number": "11019",
                "name": "Konark Express",
                "source": "CSMT",
                "destination": "BBS",
                "dep": "14:00",
                "arr": "23:15",
                "dur": "33h 15m",
                "days": "MON,TUE,WED,THU,FRI,SAT,SUN",
                "classes": "2A,3A,SL,2S",
                "type": "Express",
                "routes": [
                    ("CSMT", "Chhatrapati Shivaji Maharaj Terminus", 1, "14:00", "14:00", 0, 0.0),
                    ("DR", "Dadar Central", 2, "14:12", "14:15", 3, 8.8),
                    ("TNA", "Thane", 3, "14:38", "14:40", 2, 33.2),
                    ("KYN", "Kalyan Junction", 4, "15:02", "15:05", 3, 53.5),
                    ("KJT", "Karjat Junction", 5, "15:48", "15:50", 2, 99.2),
                    ("LNL", "Lonavala", 6, "16:38", "16:40", 2, 127.2),
                    ("PUNE", "Pune Junction", 7, "17:55", "18:00", 5, 191.0),
                    ("SUR", "Solapur", 8, "22:50", "22:55", 5, 454.0),
                ],
                "class_fares": [("2A", 2450.0), ("3A", 1720.0), ("SL", 650.0), ("2S", 390.0)]
            }
        ]

        for t_spec in trains_spec:
            train = Train(
                train_number=t_spec["number"],
                train_name=t_spec["name"],
                source=t_spec["source"],
                destination=t_spec["destination"],
                departure_time=t_spec["dep"],
                arrival_time=t_spec["arr"],
                duration=t_spec["dur"],
                running_days=t_spec["days"],
                classes=t_spec["classes"],
                train_type=t_spec["type"],
                active=True
            )
            db.add(train)
            db.flush()

            for s_code, s_name, seq, arr, dep, halt, dist in t_spec["routes"]:
                route = TrainRoute(
                    train_id=train.id,
                    station_code=s_code,
                    station_name=s_name,
                    sequence=seq,
                    arrival=arr,
                    departure=dep,
                    halt_minutes=halt,
                    distance=dist
                )
                db.add(route)

            for c_code, fare in t_spec["class_fares"]:
                t_class = TrainClass(
                    train_id=train.id,
                    class_code=c_code,
                    base_fare=fare,
                    total_seats=120,
                    available_seats=78
                )
                db.add(t_class)

        db.commit()
        print("Trains, routes, and seat availability successfully seeded!")

    # 3. Seed Users (Manali Manish Gharat, and Admin)
    manali = db.query(User).filter(User.email == "manali@railone.in").first()
    if not manali:
        manali = User(
            full_name="Manali Manish Gharat",
            email="manali@railone.in",
            phone="9820098200",
            hashed_password=hash_password("manali123"),
            mpin_hash=hash_mpin("1234"),
            role="user",
            dob="1995-04-18",
            gender="Female",
            address="Seawoods, Navi Mumbai, Maharashtra 400706",
            emergency_contact="+91 98200 98201",
            is_active=True,
            biometric_enabled=False
        )
        db.add(manali)
        db.commit()
        db.refresh(manali)

        # Manali Wallet
        m_wallet = Wallet(user_id=manali.id, balance=3500.0)
        db.add(m_wallet)
        db.commit()
        db.refresh(m_wallet)

        # Wallet welcome transaction
        tx = WalletTransaction(
            wallet_id=m_wallet.id,
            amount=3500.0,
            tx_type="CREDIT",
            description="Welcome Balance & RailOne Travel Credit",
            reference_id="TX-WELCOME-MANALI"
        )
        db.add(tx)

        # Sample Initial Booking for Manali (MMCT -> PUNE)
        pnr_init = "8421095812"
        b_init = Booking(
            booking_id="RO-20261015-48210",
            pnr_number=pnr_init,
            user_id=manali.id,
            train_number="12125",
            train_name="Pragati Express",
            source_code="MMCT",
            source_name="Mumbai Central",
            dest_code="PUNE",
            dest_name="Pune Junction",
            journey_date="2026-10-15",
            class_type="CC",
            passenger_count=2,
            fare_amount=780.0,
            status="Confirmed",
            qr_data=f"RO-SECURE:RO-20261015-48210:{pnr_init}:MANALI-CONFIRMED"
        )
        db.add(b_init)
        db.flush()

        # Tickets for booking
        t1 = Ticket(
            ticket_number="TK-MANALI-01",
            booking_id=b_init.id,
            passenger_name="Manali Manish Gharat",
            passenger_age=29,
            passenger_gender="Female",
            coach="C1",
            berth="24",
            berth_type="Window",
            status="CNF"
        )
        t2 = Ticket(
            ticket_number="TK-MANISH-02",
            booking_id=b_init.id,
            passenger_name="Manish Gharat",
            passenger_age=31,
            passenger_gender="Male",
            coach="C1",
            berth="25",
            berth_type="Aisle",
            status="CNF"
        )
        db.add_all([t1, t2])

        # Notifications for Manali (15 notifications as requested in Section 5)
        notifications_data = [
            ("Confirmed Booking", "Your journey MMCT -> PUNE on Pragati Express is confirmed. PNR: 8421095812", "booking"),
            ("Nerul–Uran Route Operational", "Suburban trains on the complete Nerul-Uran corridor are running on regular schedule.", "info"),
            ("Wallet Recharge", "₹3,500 travel balance has been credited to your RailOne Wallet.", "payment"),
            ("Platform Ticket Reminder", "Platform tickets at Mumbai Central & Thane are now available in 1-click on RailOne.", "info"),
            ("UTS Season Pass", "Renew your monthly/quarterly suburban pass with instant digital verification.", "promotion"),
            ("Train 12124 Deccan Queen", "Coach positions for today's Deccan Queen updated on Platform 1.", "info"),
            ("Pantry Car Onboard", "Order fresh railway thali and hot snacks directly to your seat.", "info"),
            ("Security Advisory", "Never share your mPIN or OTP with anyone. RailOne never asks for passwords.", "alert"),
            ("Vande Bharat Express Update", "New Vande Bharat timing adjustments for suburban sectors.", "info"),
            ("Monsoon Schedule", "All suburban line services on Western, Central, and Harbour operating normally.", "info"),
            ("Emergency Grievance Portal", "RailOne 24/7 passenger grievance support is now active.", "info"),
            ("Luggage Rules", "Please review revised permissible weight limits for AC Chair Car.", "info"),
            ("E-Catering Discount", "Use code RAILONE10 for 10% off your next IRCTC verified meal order.", "promotion"),
            ("Passkey Biometric Login", "You can now link Windows Hello or fingerprint passkeys for instant login.", "info"),
            ("Welcome to RailOne", "Your journey, simplified. Welcome to India's next-generation railway companion.", "promotion"),
        ]
        for title, msg, n_type in notifications_data:
            notif = Notification(user_id=manali.id, title=title, message=msg, type=n_type)
            db.add(notif)

        db.commit()
        print("Demo user 'Manali Manish Gharat' with wallet, booking, and 15 notifications created!")

    # Admin User
    admin = db.query(User).filter(User.email == "admin@railone.in").first()
    if not admin:
        admin = User(
            full_name="Railway Administrator",
            email="admin@railone.in",
            phone="9999999999",
            hashed_password=hash_password("admin123"),
            mpin_hash=hash_mpin("9999"),
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        a_wallet = Wallet(user_id=admin.id, balance=100000.0)
        db.add(a_wallet)
        db.commit()
        print("Admin user 'admin@railone.in' created!")

    # Fresh Production-Style Accounts
    fresh_passenger = db.query(User).filter(User.email == "manali.gharat@railone.in").first()
    if not fresh_passenger:
        fresh_passenger = User(
            full_name="Manali Gharat",
            email="manali.gharat@railone.in",
            phone="9820012345",
            hashed_password=hash_password("RailOne#2026!Manali"),
            mpin_hash=hash_mpin("8421"),
            role="user",
            dob="1995-04-18",
            gender="Female",
            address="Seawoods-Darave, Navi Mumbai, Maharashtra",
            emergency_contact="+91 98200 98201",
            is_active=True,
            biometric_enabled=True
        )
        db.add(fresh_passenger)
        db.commit()
        db.refresh(fresh_passenger)

        p_wallet = Wallet(user_id=fresh_passenger.id, balance=5000.0)
        db.add(p_wallet)
        db.commit()
        print("Fresh passenger 'manali.gharat@railone.in' created!")

    fresh_admin = db.query(User).filter(User.email == "railadmin@railone.in").first()
    if not fresh_admin:
        fresh_admin = User(
            full_name="RailOne Chief Controller",
            email="railadmin@railone.in",
            phone="9820099999",
            hashed_password=hash_password("RailAdmin#Secure2026"),
            mpin_hash=hash_mpin("7391"),
            role="admin",
            is_active=True
        )
        db.add(fresh_admin)
        db.commit()
        db.refresh(fresh_admin)

        fa_wallet = Wallet(user_id=fresh_admin.id, balance=100000.0)
        db.add(fa_wallet)
        db.commit()
        print("Fresh admin 'railadmin@railone.in' created!")

    # 4. Seed PNR Records
    existing_pnr = db.query(PNRRecord).filter(PNRRecord.pnr_number == "8421095812").first()
    if not existing_pnr:
        pax_json = json.dumps([
            {"serial_no": 1, "name": "Manali Manish Gharat", "booking_status": "CNF C1 24", "current_status": "CNF C1 24", "coach": "C1", "berth": "24", "berth_type": "Window"},
            {"serial_no": 2, "name": "Manish Gharat", "booking_status": "CNF C1 25", "current_status": "CNF C1 25", "coach": "C1", "berth": "25", "berth_type": "Aisle"}
        ])
        pnr_rec = PNRRecord(
            pnr_number="8421095812",
            train_number="12125",
            train_name="Pragati Express",
            source="Mumbai Central (MMCT)",
            destination="Pune Junction (PUNE)",
            journey_date="2026-10-15",
            class_type="CC",
            chart_status="Chart Prepared",
            passengers_json=pax_json,
            is_demo=False
        )
        db.add(pnr_rec)
        db.commit()

    # 5. Seed Restaurants and Menu Items
    existing_restaurants = db.query(Restaurant).count()
    if existing_restaurants == 0:
        print("Seeding railway restaurants and menus...")
        restaurants = [
            {
                "name": "Pahila Bhog Railway Kitchen",
                "station_code": "MMCT",
                "station_name": "Mumbai Central",
                "rating": 4.8,
                "time": 20,
                "cuisines": "North Indian, Thali, Snacks",
                "pure_veg": True,
                "items": [
                    ("Special Maharaja Thali", "Paneer butter masala, dal makhani, 4 rotis, jeera rice, gulab jamun, pickle", 280.0, True, "Thali"),
                    ("Paneer Butter Masala Combo", "Rich paneer gravy with 3 butter rotis and salad", 190.0, True, "Meals"),
                    ("Mumbai Masala Pav (2 pcs)", "Buttered pav stuffed with spiced potato filling", 70.0, True, "Snacks"),
                    ("Filter Coffee / Masala Chai", "Hot aromatic railway brewing", 30.0, True, "Beverages"),
                ]
            },
            {
                "name": "Deccan Flavours Express",
                "station_code": "PUNE",
                "station_name": "Pune Junction",
                "rating": 4.7,
                "time": 25,
                "cuisines": "Maharashtrian, South Indian, Fast Food",
                "pure_veg": False,
                "items": [
                    ("Puneri Misal Pav with Farsan", "Authentic spicy kat with soft pav and lemon wedges", 90.0, True, "Snacks"),
                    ("Chicken Biryani Box", "Dum cooked fragrant basmati rice with succulent chicken & raita", 240.0, False, "Meals"),
                    ("Ghee Podi Idli (4 pcs)", "Mini idlis tossed in gun powder ghee with coconut chutney", 80.0, True, "Snacks"),
                    ("Fresh Mango Lassi", "Chilled creamy sweet Alphonso mango lassi", 60.0, True, "Beverages"),
                ]
            },
            {
                "name": "Navi Mumbai Coastal Kitchen",
                "station_code": "NEU",
                "station_name": "Nerul Junction",
                "rating": 4.6,
                "time": 18,
                "cuisines": "Konkani, Snacks, Beverages",
                "pure_veg": False,
                "items": [
                    ("Kanda Batata Poha", "Traditional Maharashtrian breakfast with roasted peanuts", 50.0, True, "Snacks"),
                    ("Vada Pav Classic (2 pcs)", "Mumbai's favorite station snack with garlic chutney", 40.0, True, "Snacks"),
                    ("Surmai Fish Fry Rice Plate", "Crispy spiced kingfish fry served with steam rice and amti", 290.0, False, "Meals"),
                    ("Solkadhi Cooler", "Digestive kokum drink infused with coconut milk and garlic", 45.0, True, "Beverages"),
                ]
            }
        ]

        for r_data in restaurants:
            rest = Restaurant(
                name=r_data["name"],
                station_code=r_data["station_code"],
                station_name=r_data["station_name"],
                rating=r_data["rating"],
                delivery_time_mins=r_data["time"],
                cuisines=r_data["cuisines"],
                is_pure_veg=r_data["pure_veg"],
                active=True
            )
            db.add(rest)
            db.flush()

            for item_name, desc, price, is_veg, cat in r_data["items"]:
                m_item = MenuItem(
                    restaurant_id=rest.id,
                    name=item_name,
                    description=desc,
                    price=price,
                    is_veg=is_veg,
                    category=cat,
                    available=True
                )
                db.add(m_item)
        db.commit()
        print("Restaurants and menu items seeded!")

    db.close()
    print("ALL SEEDING COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    seed_database()
