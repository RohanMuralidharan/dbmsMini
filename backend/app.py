from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

DB_URL = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

### Models

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=True)
    email = db.Column(db.String, nullable=True)
    address = db.Column(db.String, nullable=True)
    wallet_balance = db.Column(db.Numeric, default=0)

class Driver(db.Model):
    __tablename__ = 'drivers'
    driver_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=True)
    license_no = db.Column(db.String, nullable=True)
    vehicle_no = db.Column(db.String, nullable=True)
    rating = db.Column(db.Numeric, default=0)
    status = db.Column(db.String, default='available')  # available/busy

class Restaurant(db.Model):
    __tablename__ = 'restaurants'
    restaurant_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    location = db.Column(db.String, nullable=True)
    cuisine = db.Column(db.String, nullable=True)
    rating = db.Column(db.Numeric, default=0)

class MenuItem(db.Model):
    __tablename__ = 'menu_items'
    item_id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.restaurant_id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    price = db.Column(db.Numeric, nullable=False)
    availability = db.Column(db.Boolean, default=True)


class DeliveryPartner(db.Model):
    __tablename__ = 'delivery_partners'
    partner_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=True)
    vehicle_no = db.Column(db.String, nullable=True)
    status = db.Column(db.String, default='available')

class Ride(db.Model):
    __tablename__ = 'rides'
    ride_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.driver_id'), nullable=False)
    source = db.Column(db.String, nullable=False)
    destination = db.Column(db.String, nullable=False)
    fare = db.Column(db.Numeric, nullable=False)
    status = db.Column(db.String, default='requested')
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

class Order(db.Model):
    __tablename__ = 'orders'
    order_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.restaurant_id'), nullable=False)
    partner_id = db.Column(db.Integer, db.ForeignKey('delivery_partners.partner_id'), nullable=True)
    total_amount = db.Column(db.Numeric, nullable=False)
    status = db.Column(db.String, default='placed')
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('menu_items.item_id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

class Payment(db.Model):
    __tablename__ = 'payments'
    payment_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.ride_id'), nullable=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id'), nullable=True)
    amount = db.Column(db.Numeric, nullable=False)
    mode = db.Column(db.String, nullable=False)
    status = db.Column(db.String, default='pending')

class Rating(db.Model):
    __tablename__ = 'ratings'
    rating_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    target_id = db.Column(db.Integer, nullable=False)  # driver_id or restaurant_id
    target_type = db.Column(db.String, nullable=False)  # 'driver' or 'restaurant'
    score = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.String, nullable=True)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

### Helpers

def result_to_dict(result):
    """Converts SQLAlchemy ResultProxy items to a list of dictionaries."""
    return [dict(row._mapping) for row in result]

### Routes (RAW SQL implementation)

@app.route('/')
def index():
    return jsonify({'status': 'ok', 'message': 'Multi-service platform API (Raw SQL Version)'})

# Create endpoints
@app.route('/api/users/create', methods=['POST'])
def create_user():
    data = request.json or {}
    sql = text("""
        INSERT INTO users (name, phone, email, address, wallet_balance) 
        VALUES (:name, :phone, :email, :address, :wallet_balance)
    """)
    params = {
        'name': data.get('name'), 
        'phone': data.get('phone'), 
        'email': data.get('email'), 
        'address': data.get('address'), 
        'wallet_balance': data.get('wallet_balance', 0)
    }
    db.session.execute(sql, params)
    db.session.commit()
    
    # Fetch the created user (assuming last inserted for simplicity or query by phone/email ideal)
    # For SQLite: SELECT * FROM users WHERE rowid = last_insert_rowid()
    # For robust demo:
    return jsonify({'status': 'created', 'data': data})

@app.route('/api/users/list', methods=['GET'])
def list_users():
    sql = text("SELECT * FROM users")
    result = db.session.execute(sql)
    return jsonify(result_to_dict(result))

@app.route('/api/drivers/create', methods=['POST'])
def create_driver():
    data = request.json or {}
    sql = text("""
        INSERT INTO drivers (name, phone, license_no, vehicle_no, rating, status)
        VALUES (:name, :phone, :license_no, :vehicle_no, :rating, :status)
    """)
    params = {
        'name': data.get('name'),
        'phone': data.get('phone'),
        'license_no': data.get('license_no'),
        'vehicle_no': data.get('vehicle_no'),
        'rating': data.get('rating', 0),
        'status': data.get('status', 'available')
    }
    db.session.execute(sql, params)
    db.session.commit()
    return jsonify({'status': 'created', 'data': data})

@app.route('/api/drivers/list', methods=['GET'])
def list_drivers():
    sql = text("SELECT * FROM drivers")
    result = db.session.execute(sql)
    return jsonify(result_to_dict(result))

@app.route('/api/restaurants/create', methods=['POST'])
def create_restaurant():
    data = request.json or {}
    sql = text("""
        INSERT INTO restaurants (name, location, cuisine, rating)
        VALUES (:name, :location, :cuisine, :rating)
    """)
    params = {
        'name': data.get('name'),
        'location': data.get('location'),
        'cuisine': data.get('cuisine'),
        'rating': data.get('rating', 0)
    }
    db.session.execute(sql, params)
    db.session.commit()
    return jsonify({'status': 'created', 'data': data})

@app.route('/api/restaurants/list', methods=['GET'])
def list_restaurants():
    sql = text("SELECT * FROM restaurants")
    result = db.session.execute(sql)
    return jsonify(result_to_dict(result))

@app.route('/api/menu_items/create', methods=['POST'])
def create_menu_item():
    data = request.json or {}
    sql = text("""
        INSERT INTO menu_items (restaurant_id, name, price, availability)
        VALUES (:restaurant_id, :name, :price, :availability)
    """)
    params = {
        'restaurant_id': data['restaurant_id'],
        'name': data['name'],
        'price': data['price'],
        'availability': data.get('availability', True)
    }
    db.session.execute(sql, params)
    db.session.commit()
    return jsonify({'status': 'created', 'data': data})

@app.route('/api/menu_items/list', methods=['GET'])
def list_menu_items():
    sql = text("SELECT * FROM menu_items")
    result = db.session.execute(sql)
    return jsonify(result_to_dict(result))

# Alias for frontend compatibility
@app.route('/api/menu-items/list', methods=['GET'])
def list_menu_items_alias():
    return list_menu_items()


@app.route('/api/delivery_partners/create', methods=['POST'])
def create_partner():
    data = request.json or {}
    sql = text("""
        INSERT INTO delivery_partners (name, phone, vehicle_no, status)
        VALUES (:name, :phone, :vehicle_no, :status)
    """)
    params = {
        'name': data.get('name'),
        'phone': data.get('phone'),
        'vehicle_no': data.get('vehicle_no'),
        'status': data.get('status', 'available')
    }
    db.session.execute(sql, params)
    db.session.commit()
    return jsonify({'status': 'created', 'data': data})


@app.route('/api/delivery_partners/list', methods=['GET'])
def list_partners():
    sql = text("SELECT * FROM delivery_partners")
    result = db.session.execute(sql)
    return jsonify(result_to_dict(result))

@app.route('/api/orders/create', methods=['POST'])
def create_order():
    data = request.json or {}
    # 1. Insert Order
    sql_order = text("""
        INSERT INTO orders (user_id, restaurant_id, partner_id, total_amount, status)
        VALUES (:user_id, :restaurant_id, :partner_id, :total_amount, :status)
    """)
    params_order = {
        'user_id': data['user_id'],
        'restaurant_id': data['restaurant_id'],
        'partner_id': data.get('partner_id'),
        'total_amount': data['total_amount'],
        'status': data.get('status', 'placed')
    }
    db.session.execute(sql_order, params_order)
    # Get ID explicitly (SQLite specific, but good for demo)
    order_id = db.session.execute(text("SELECT last_insert_rowid()")).scalar()
    
    # 2. Insert Items
    items = data.get('items', [])
    if items and order_id:
        sql_item = text("""
            INSERT INTO order_items (order_id, item_id, quantity)
            VALUES (:order_id, :item_id, :quantity)
        """)
        for item in items:
            db.session.execute(sql_item, {
                'order_id': order_id,
                'item_id': item['item_id'],
                'quantity': item.get('quantity', 1)
            })
            
    db.session.commit()
    return jsonify({'status': 'created', 'order_id': order_id})

@app.route('/api/orders/list', methods=['GET'])
def list_orders():
    sql = text("SELECT * FROM orders")
    result = db.session.execute(sql)
    return jsonify(result_to_dict(result))

@app.route('/api/rides/create', methods=['POST'])
def create_ride():
    data = request.json or {}
    sql = text("""
        INSERT INTO rides (user_id, driver_id, source, destination, fare, status)
        VALUES (:user_id, :driver_id, :source, :destination, :fare, :status)
    """)
    params = {
        'user_id': data['user_id'],
        'driver_id': data['driver_id'],
        'source': data['source'],
        'destination': data['destination'],
        'fare': data['fare'],
        'status': data.get('status', 'requested')
    }
    db.session.execute(sql, params)
    db.session.commit()
    return jsonify({'status': 'created', 'data': data})

@app.route('/api/rides/list', methods=['GET'])
def list_rides():
    sql = text("SELECT * FROM rides")
    result = db.session.execute(sql)
    return jsonify(result_to_dict(result))

@app.route('/api/payments/create', methods=['POST'])
def create_payment():
    data = request.json or {}
    sql = text("""
        INSERT INTO payments (user_id, ride_id, order_id, amount, mode, status)
        VALUES (:user_id, :ride_id, :order_id, :amount, :mode, :status)
    """)
    params = {
        'user_id': data['user_id'],
        'ride_id': data.get('ride_id'),
        'order_id': data.get('order_id'),
        'amount': data['amount'],
        'mode': data['mode'],
        'status': data.get('status', 'pending')
    }
    db.session.execute(sql, params)
    db.session.commit()
    return jsonify({'status': 'created', 'data': data})

@app.route('/api/payments/list', methods=['GET'])
def list_payments():
    sql = text("SELECT * FROM payments")
    result = db.session.execute(sql)
    return jsonify(result_to_dict(result))

@app.route('/api/ratings/create', methods=['POST'])
def create_rating():
    data = request.json or {}
    sql = text("""
        INSERT INTO ratings (user_id, target_id, target_type, score, comment)
        VALUES (:user_id, :target_id, :target_type, :score, :comment)
    """)
    params = {
        'user_id': data['user_id'],
        'target_id': data['target_id'],
        'target_type': data['target_type'],
        'score': data['score'],
        'comment': data.get('comment')
    }
    db.session.execute(sql, params)
    db.session.commit()
    return jsonify({'status': 'created', 'data': data})

@app.route('/api/ratings/list', methods=['GET'])
def list_ratings():
    sql = text("SELECT * FROM ratings")
    result = db.session.execute(sql)
    return jsonify(result_to_dict(result))

### Delete endpoints

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    sql = text("DELETE FROM users WHERE user_id = :id")
    result = db.session.execute(sql, {'id': user_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({'error':'not found'}), 404
    return jsonify({'status':'deleted', 'user_id': user_id})

@app.route('/api/drivers/<int:driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    sql = text("DELETE FROM drivers WHERE driver_id = :id")
    result = db.session.execute(sql, {'id': driver_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({'error':'not found'}), 404
    return jsonify({'status':'deleted', 'driver_id': driver_id})

@app.route('/api/restaurants/<int:restaurant_id>', methods=['DELETE'])
def delete_restaurant(restaurant_id):
    sql = text("DELETE FROM restaurants WHERE restaurant_id = :id")
    result = db.session.execute(sql, {'id': restaurant_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({'error':'not found'}), 404
    return jsonify({'status':'deleted', 'restaurant_id': restaurant_id})

@app.route('/api/menu_items/<int:item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    sql = text("DELETE FROM menu_items WHERE item_id = :id")
    result = db.session.execute(sql, {'id': item_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({'error':'not found'}), 404
    return jsonify({'status':'deleted', 'item_id': item_id})

@app.route('/api/delivery_partners/<int:partner_id>', methods=['DELETE'])
def delete_partner(partner_id):
    sql = text("DELETE FROM delivery_partners WHERE partner_id = :id")
    result = db.session.execute(sql, {'id': partner_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({'error':'not found'}), 404
    return jsonify({'status':'deleted', 'partner_id': partner_id})

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    # Order items cascade or manual delete?
    # Manual delete first
    sql_items = text("DELETE FROM order_items WHERE order_id = :id")
    db.session.execute(sql_items, {'id': order_id})
    
    sql = text("DELETE FROM orders WHERE order_id = :id")
    result = db.session.execute(sql, {'id': order_id})
    db.session.commit()
    
    if result.rowcount == 0:
        return jsonify({'error':'not found'}), 404
    return jsonify({'status':'deleted', 'order_id': order_id})

@app.route('/api/rides/<int:ride_id>', methods=['DELETE'])
def delete_ride(ride_id):
    sql = text("DELETE FROM rides WHERE ride_id = :id")
    result = db.session.execute(sql, {'id': ride_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({'error':'not found'}), 404
    return jsonify({'status':'deleted', 'ride_id': ride_id})

@app.route('/api/payments/<int:payment_id>', methods=['DELETE'])
def delete_payment(payment_id):
    sql = text("DELETE FROM payments WHERE payment_id = :id")
    result = db.session.execute(sql, {'id': payment_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({'error':'not found'}), 404
    return jsonify({'status':'deleted', 'payment_id': payment_id})

@app.route('/api/ratings/<int:rating_id>', methods=['DELETE'])
def delete_rating(rating_id):
    sql = text("DELETE FROM ratings WHERE rating_id = :id")
    result = db.session.execute(sql, {'id': rating_id})
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({'error':'not found'}), 404
    return jsonify({'status':'deleted', 'rating_id': rating_id})

### CLI helper
@app.cli.command('db_create')
def db_create():
    db.create_all()
    print('Database created.')


@app.cli.command('db_reset')
def db_reset():
    db.drop_all()
    db.create_all()
    print('Database reset (dropped and recreated all tables).')

@app.cli.command('seed_db')
def seed_db():
    print('Seeding database with comprehensive Bangalore-based data...')
    
    # 1. Create Users (Bangalore Residents)
    users_data = [
        {'name': 'Rahul Sharma', 'phone': '9876543210', 'email': 'rahul.s@example.com', 'address': '4th Block, Koramangala, Bangalore', 'wallet_balance': 2500},
        {'name': 'Priya Venkatesh', 'phone': '9876543211', 'email': 'priya.v@example.com', 'address': '100ft Road, Indiranagar, Bangalore', 'wallet_balance': 1500},
        {'name': 'Amit Patel', 'phone': '9876543212', 'email': 'amit.p@example.com', 'address': 'Prestige Shantiniketan, Whitefield, Bangalore', 'wallet_balance': 5000},
        {'name': 'Sneha Reddy', 'phone': '9876543213', 'email': 'sneha.r@example.com', 'address': 'Sector 2, HSR Layout, Bangalore', 'wallet_balance': 800},
        {'name': 'Vikram Singh', 'phone': '9876543214', 'email': 'vikram.s@example.com', 'address': '9th Block, Jayanagar, Bangalore', 'wallet_balance': 1200},
    ]
    
    users = []
    for u_data in users_data:
        u = User(**u_data)
        db.session.add(u)
        users.append(u)
    db.session.commit()
    print(f'Created {len(users)} users')

    # 2. Create Drivers (Active in Bangalore)
    drivers_data = [
        {'name': 'Manjunath Swamy', 'phone': '9123456701', 'license_no': 'KA01-2018-001122', 'vehicle_no': 'KA-01-AA-1234', 'rating': 4.8, 'status': 'available'}, # Auto
        {'name': 'Shivakumar M', 'phone': '9123456702', 'license_no': 'KA03-2019-002233', 'vehicle_no': 'KA-03-BB-5678', 'rating': 4.5, 'status': 'available'}, # Sedan
        {'name': 'Abdul Razak', 'phone': '9123456703', 'license_no': 'KA05-2020-003344', 'vehicle_no': 'KA-05-CC-9012', 'rating': 4.9, 'status': 'busy'}, # Prime SUV
        {'name': 'Ravi Kumar', 'phone': '9123456704', 'license_no': 'KA51-2021-004455', 'vehicle_no': 'KA-51-DD-3456', 'rating': 4.2, 'status': 'available'}, # Mini
        {'name': 'Gowtham N', 'phone': '9123456705', 'license_no': 'KA53-2022-005566', 'vehicle_no': 'KA-53-EE-7890', 'rating': 4.6, 'status': 'available'}, # Bike Taxi
    ]

    drivers = []
    for d_data in drivers_data:
        d = Driver(**d_data)
        db.session.add(d)
        drivers.append(d)
    db.session.commit()
    print(f'Created {len(drivers)} drivers')

    # 3. Create Restaurants (Popular Bangalore Spots)
    restaurants_data = [
        {'name': 'Meghana Foods', 'location': 'Koramangala', 'cuisine': 'Andhra/Biryani', 'rating': 4.7},
        {'name': 'Truffles', 'location': 'Indiranagar', 'cuisine': 'Burgers/Continental', 'rating': 4.5},
        {'name': 'Empire Restaurant', 'location': 'MG Road', 'cuisine': 'North Indian/Kebabs', 'rating': 4.2},
        {'name': 'Vidyarthi Bhavan', 'location': 'Basavanagudi', 'cuisine': 'South Indian', 'rating': 4.8}, # Near Jayanagar
        {'name': 'Mainland China', 'location': 'Whitefield', 'cuisine': 'Chinese', 'rating': 4.4},
    ]

    restaurants = []
    for r_data in restaurants_data:
        r = Restaurant(**r_data)
        db.session.add(r)
        restaurants.append(r)
    db.session.commit()
    print(f'Created {len(restaurants)} restaurants')

    # 4. Create Menu Items
    menu_items = []
    # Meghana Foods (Rest 0)
    menu_items += [
        {'restaurant_id': restaurants[0].restaurant_id, 'name': 'Special Chicken Biryani', 'price': 320, 'availability': True},
        {'restaurant_id': restaurants[0].restaurant_id, 'name': 'Mutton Biryani', 'price': 380, 'availability': True},
        {'restaurant_id': restaurants[0].restaurant_id, 'name': 'Paneer 65', 'price': 240, 'availability': True},
        {'restaurant_id': restaurants[0].restaurant_id, 'name': 'Andhra Chilli Chicken', 'price': 290, 'availability': True},
    ]
    # Truffles (Rest 1)
    menu_items += [
        {'restaurant_id': restaurants[1].restaurant_id, 'name': 'All American Cheese Burger', 'price': 210, 'availability': True},
        {'restaurant_id': restaurants[1].restaurant_id, 'name': 'Peri Peri Fries', 'price': 140, 'availability': True},
        {'restaurant_id': restaurants[1].restaurant_id, 'name': 'Ferrero Rocher Shake', 'price': 180, 'availability': True},
        {'restaurant_id': restaurants[1].restaurant_id, 'name': 'Truffles Special Steak', 'price': 350, 'availability': True},
    ]
    # Empire (Rest 2)
    menu_items += [
        {'restaurant_id': restaurants[2].restaurant_id, 'name': 'Ghee Rice & Kabab Combo', 'price': 250, 'availability': True},
        {'restaurant_id': restaurants[2].restaurant_id, 'name': 'Butter Chicken', 'price': 280, 'availability': True},
        {'restaurant_id': restaurants[2].restaurant_id, 'name': 'Kerala Parotta', 'price': 30, 'availability': True},
        {'restaurant_id': restaurants[2].restaurant_id, 'name': 'Grilled Chicken (Full)', 'price': 450, 'availability': True},
    ]
    # Vidyarthi Bhavan (Rest 3)
    menu_items += [
        {'restaurant_id': restaurants[3].restaurant_id, 'name': 'Masala Dosa', 'price': 60, 'availability': True},
        {'restaurant_id': restaurants[3].restaurant_id, 'name': 'Idli Vada', 'price': 50, 'availability': True},
        {'restaurant_id': restaurants[3].restaurant_id, 'name': 'Filter Coffee', 'price': 25, 'availability': True},
        {'restaurant_id': restaurants[3].restaurant_id, 'name': 'Kesari Bath', 'price': 40, 'availability': True},
    ]
    # Mainland China (Rest 4)
    menu_items += [
        {'restaurant_id': restaurants[4].restaurant_id, 'name': 'Dim Sums', 'price': 290, 'availability': True},
        {'restaurant_id': restaurants[4].restaurant_id, 'name': 'Hakka Noodles', 'price': 240, 'availability': True},
        {'restaurant_id': restaurants[4].restaurant_id, 'name': 'Kung Pao Chicken', 'price': 320, 'availability': True},
    ]

    for m_data in menu_items:
        db.session.add(MenuItem(**m_data))
    db.session.commit()
    print(f'Created {len(menu_items)} menu items')

    # 5. Create Delivery Partners
    partners_data = [
        {'name': 'Dunzo Partner', 'phone': '9900112233', 'vehicle_no': 'KA-01-DZ-1111', 'status': 'available'},
        {'name': 'Swiggy Genie', 'phone': '9900112234', 'vehicle_no': 'KA-02-SW-2222', 'status': 'busy'},
        {'name': 'Zomato Valet', 'phone': '9900112235', 'vehicle_no': 'KA-03-ZO-3333', 'status': 'available'},
    ]
    
    partners = []
    for p_data in partners_data:
        p = DeliveryPartner(**p_data)
        db.session.add(p)
        partners.append(p)
    db.session.commit()
    print(f'Created {len(partners)} delivery partners')

    # 6. Create Connected Orders
    # Order 1: Rahul (Kormangala) orders from Meghana (Kormangala)
    o1 = Order(user_id=users[0].user_id, restaurant_id=restaurants[0].restaurant_id, partner_id=partners[0].partner_id, total_amount=640, status='delivered')
    db.session.add(o1)
    db.session.commit() # Commit to get ID
    db.session.add(OrderItem(order_id=o1.order_id, item_id=1, quantity=2)) # 2 Biryanis
    
    # Order 2: Priya (Indiranagar) orders from Truffles (Indiranagar)
    o2 = Order(user_id=users[1].user_id, restaurant_id=restaurants[1].restaurant_id, partner_id=partners[2].partner_id, total_amount=210, status='placed')
    db.session.add(o2)
    db.session.commit()
    db.session.add(OrderItem(order_id=o2.order_id, item_id=5, quantity=1)) # 1 Burger
    
    # Order 3: Amit (Whitefield) orders from Mainland China (Whitefield)
    o3 = Order(user_id=users[2].user_id, restaurant_id=restaurants[4].restaurant_id, partner_id=partners[1].partner_id, total_amount=560, status='delivering')
    db.session.add(o3)
    db.session.commit()
    db.session.add(OrderItem(order_id=o3.order_id, item_id=18, quantity=1)) # Noodles
    db.session.add(OrderItem(order_id=o3.order_id, item_id=19, quantity=1)) # Chicken

    db.session.commit()
    print('Created sample connected orders')

    # 7. Create Connected Rides
    rides_data = [
        # Rahul goes from Koramangala to Indiranagar (Meets Priya)
        {'user_id': users[0].user_id, 'driver_id': drivers[0].driver_id, 'source': 'Koramangala', 'destination': 'Indiranagar', 'fare': 140, 'status': 'completed'},
        # Priya goes from Indiranagar to MG Road (Empire)
        {'user_id': users[1].user_id, 'driver_id': drivers[1].driver_id, 'source': 'Indiranagar', 'destination': 'MG Road', 'fare': 180, 'status': 'completed'},
        # Vikram goes from Jayanagar to Basavanagudi (Vidyarthi Bhavan)
        {'user_id': users[4].user_id, 'driver_id': drivers[3].driver_id, 'source': 'Jayanagar', 'destination': 'Basavanagudi', 'fare': 60, 'status': 'requested'},
        # Sneha goes from HSR to Kormangala
        {'user_id': users[3].user_id, 'driver_id': drivers[4].driver_id, 'source': 'HSR Layout', 'destination': 'Koramangala', 'fare': 90, 'status': 'ongoing'},
    ]
    
    rides = []
    for r_data in rides_data:
        r = Ride(**r_data)
        db.session.add(r)
        rides.append(r)
    db.session.commit()
    print(f'Created {len(rides)} sample rides')

    # 8. Create Ratings
    ratings_data = [
        {'user_id': users[0].user_id, 'target_id': drivers[0].driver_id, 'target_type': 'driver', 'score': 5, 'comment': 'Excellent auto ride, avoided traffic!'},
        {'user_id': users[0].user_id, 'target_id': restaurants[0].restaurant_id, 'target_type': 'restaurant', 'score': 5, 'comment': 'Best Biryani in Bangalore!'},
        {'user_id': users[1].user_id, 'target_id': restaurants[1].restaurant_id, 'target_type': 'restaurant', 'score': 4, 'comment': 'Good burgers, but waiting time is high.'},
    ]
    
    for rate_data in ratings_data:
        db.session.add(Rating(**rate_data))
    db.session.commit()
    
    print('Seed data generation completed successfully!')


if __name__ == '__main__':
    app.run(debug=True, port=5001)
