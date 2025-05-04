# Kleis API

A FastAPI-based backend API for the Kleis peptide storefront, providing product data, inventory status, and admin functionality.

## 🚀 Technology Stack

- **FastAPI** - Modern, high-performance web framework for building APIs
- **APSW (Another Python SQLite Wrapper)** - Advanced SQLite wrapper for Python
- **Pydantic** - Data validation and settings management
- **Uvicorn** - ASGI server for serving the FastAPI application
- **Python 3.11+** - Modern Python runtime
- **uv** - Ultra-fast Python package manager and resolver

## 📁 Project Structure

```
api/
├── src/                  # Source code
│   ├── models/           # Pydantic models for request/response
│   ├── routes/           # API route handlers
│   │   ├── public.py     # Public endpoints
│   │   └── admin.py      # Admin endpoints (authenticated)
│   ├── db/               # Database utilities
│   │   └── connection.py # SQLite connection management
│   ├── auth/             # Authentication utilities
│   ├── config.py         # Configuration settings
│   └── main.py           # Application entry point
├── tests/                # Test suite
├── pyproject.toml        # Project dependencies and metadata
├── uv.lock               # Lock file for deterministic builds with uv
├── .python-version       # Python version specification
└── README.md             # This documentation
```

## 🔄 API Endpoints

### Public Endpoints

- `GET /api/sku/{id}` - Get product details including price, mg, and stock status
- `GET /api/substances` - List all available substances
- `GET /api/substances/{slug}` - Get detailed information about a specific substance
- `GET /api/categories` - List all product categories
- `GET /api/categories/{slug}` - Get products in a specific category

### Admin Endpoints (Authenticated)

- `PATCH /api/admin/sku/{id}` - Update price or stock for a product
- `POST /api/admin/batches` - Add a new batch of a product
- `GET /api/admin/inventory` - Get inventory status for all products
- `POST /api/admin/substances` - Add a new substance
- `POST /api/admin/variants` - Add a new variant for an existing substance

## 🛠️ Setup and Installation with uv

### Why uv?

[uv](https://github.com/astral-sh/uv) is a modern Python package manager that offers:

- **Speed**: 10-100x faster than pip for installations
- **Reliability**: Deterministic builds with lockfiles
- **Isolation**: Clean virtual environments
- **Compatibility**: Drop-in replacement for pip

### Prerequisites

- Python 3.11 or higher
- uv (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Access to the SQLite database (catalog.db)

### Installation

1. **Just use uv! The env is provided for you**

```bash
uv run python src/main.py
```

2. **Configure environment variables**

Create a `.env` file in the api directory:

```
DATABASE_PATH=../data/database/catalog.db
API_KEY=your_secure_api_key_for_admin_endpoints
DEBUG=true
```

## 🚀 Running the API

### Development Mode

```bash
# Start the development server with auto-reload
uv run uvicorn src.main:app --reload --port 8000

# Start the production server
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000
```
```bash
# Start the production server
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## 🧪 Testing

```bash
# Install test dependencies
uv add pytest pytest-asyncio httpx

# Run tests
uv run pytest
```

## 📝 API Usage Examples

### Fetch Product Information

```bash
curl http://localhost:8000/api/sku/BPC157-5MG
```

Response:
```json
{
  "sku": "BPC157-5MG",
  "price_cents": 3499,
  "mg": 5,
  "in_stock": true,
  "substance": {
    "name": "BPC-157",
    "slug": "bpc-157"
  }
}
```

### Update Product Price (Admin)

```bash
curl -X PATCH http://localhost:8000/api/admin/sku/BPC157-5MG \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"price_cents": 3699}'
```

## 🔒 Authentication

Admin endpoints are protected with API key authentication. Include the API key in the Authorization header:

```
Authorization: Bearer your_api_key
```

## 📊 Database Integration

The API connects to the SQLite database created by the `load_catalog.py` script in the `data/` directory. The database contains tables for substances, variants, batches, inventory, and categories.

Key database operations:
- Read-only operations for public endpoints
- Write operations for admin endpoints (price updates, inventory management)
- Uses WAL (Write-Ahead Logging) mode for better concurrency

## 🔄 Admin CLI

For administrative tasks, you can use the `admin_cli.py` script:

```bash
# Update price
python api/admin_cli.py set-price BPC157-5MG 3499

# Update stock status
python api/admin_cli.py set-stock BPC157-5MG false
```

## 🚧 Development Workflow with uv

### Adding Dependencies

```bash
# Add a new dependency
uv add package-name
```

### Syncing Dependencies

```bash
# Sync dependencies from lockfile
uv sync
```

### Upgrading Dependencies

```bash
# Upgrade a specific package
uv lock --upgrade-package package-name
```

## 🔍 Dependency Management Benefits with uv

- **Faster Installations**: uv's parallel downloads and optimized resolver
- **Reproducible Builds**: The uv.lock file ensures consistent environments
- **Improved Security**: Reduced supply chain risks with better dependency resolution
- **Simplified Workflow**: Single tool for dependency management

## 🧠 Development Guidelines

1. **Code Style**
   - Follow PEP 8 guidelines
   - Use type hints for all function parameters and return values
   - Document all functions and classes with docstrings

2. **API Design**
   - Follow RESTful principles
   - Use appropriate HTTP methods and status codes
   - Validate all input data with Pydantic models

3. **Error Handling**
   - Return appropriate HTTP status codes
   - Provide meaningful error messages
   - Log errors for debugging

4. **Testing**
   - Write unit tests for all endpoints
   - Test both success and error cases
   - Use pytest fixtures for database setup