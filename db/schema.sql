CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    passport TEXT,
    city TEXT,
    discount INTEGER DEFAULT 0
);

CREATE TABLE tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    city TEXT,
    start_date TEXT,
    end_date TEXT,
    services TEXT,
    price REAL,
    total_seats INTEGER,
    available_seats INTEGER
);

CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    position TEXT
);

CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    quantity INTEGER,
    client_id INTEGER,
    tour_id INTEGER,
    employee_id INTEGER,
    FOREIGN KEY(client_id) REFERENCES clients(id),
    FOREIGN KEY(tour_id) REFERENCES tours(id),
    FOREIGN KEY(employee_id) REFERENCES employees(id)
);
