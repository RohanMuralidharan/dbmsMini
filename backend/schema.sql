
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  wallet_balance NUMERIC DEFAULT 0
);

CREATE TABLE drivers (
  driver_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  license_no TEXT,
  vehicle_no TEXT,
  rating NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'available'
);

CREATE TABLE restaurants (
  restaurant_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  cuisine TEXT,
  rating NUMERIC DEFAULT 0
);

CREATE TABLE menu_items (
  item_id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  availability BOOLEAN DEFAULT true
);

CREATE TABLE delivery_partners (
  partner_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  vehicle_no TEXT,
  status TEXT DEFAULT 'available'
);

CREATE TABLE rides (
  ride_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  driver_id INTEGER NOT NULL REFERENCES drivers(driver_id),
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  fare NUMERIC NOT NULL,
  status TEXT DEFAULT 'requested',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id),
  partner_id INTEGER REFERENCES delivery_partners(partner_id),
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'placed',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES menu_items(item_id),
  quantity INTEGER NOT NULL
);

CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  ride_id INTEGER REFERENCES rides(ride_id),
  order_id INTEGER REFERENCES orders(order_id),
  amount NUMERIC NOT NULL,
  mode TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE ratings (
  rating_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  target_id INTEGER NOT NULL,
  target_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  comment TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
