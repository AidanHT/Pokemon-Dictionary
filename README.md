# Pokemon Database Web Application

A full-stack web application that allows users to search and filter Pokemon from a MySQL database. Built with React, Node.js, Express, and MySQL.

## Features

- View all Pokemon with their stats
- Search Pokemon by name
- Filter Pokemon by type
- Responsive design with Material-UI
- Real-time search updates

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Setup

### Database Setup

1. Create a new MySQL database named `pokemon_db`
2. Import the Pokemon data from the provided CSV file
3. Create a table with the following structure:

```sql
CREATE TABLE pokemon (
    Name VARCHAR(255),
    Name2 VARCHAR(255),
    Primary_Type VARCHAR(50),
    Secondary_type VARCHAR(50),
    Attack INT,
    Defense INT,
    HP INT,
    Sp_Attack INT,
    Sp_Defense INT,
    Speed INT,
    Total INT
);
```

### Backend Setup

1. Navigate to the api directory:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the api directory with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=pokemon_db
PORT=5000
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

- Use the search bar to find Pokemon by name
- Use the type filter dropdown to filter Pokemon by their primary or secondary type
- View detailed stats for each Pokemon in the cards

## API Endpoints

- `GET /api/pokemon` - Get all Pokemon
- `GET /api/pokemon/search?name=:name` - Search Pokemon by name
- `GET /api/pokemon/type/:type` - Filter Pokemon by type 