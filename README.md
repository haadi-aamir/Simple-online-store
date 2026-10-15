# Simple Online Store

A Django-based e-commerce website built with Python, Django, HTML, CSS, and JavaScript. The project provides a foundation for an online shopping experience, including user accounts, product search, product reviews, cart functionality, ordering, and order history.

**Repository:** [haadi-aamir/Simple-online-store](https://github.com/haadi-aamir/Simple-online-store)

## Features

- **User Authentication** — Create an account, log in, and log out.
- **Product Search** — Search for products in the store.
- **Shopping Cart** — Add products to a cart and manage cart items.
- **Ordering** — Place orders through the website.
- **Order History** — View previous orders.
- **Product Categories** — Browse products organized into categories.

> **Note:** The project is still under development. Some interface elements, including sorting buttons on product pages, are not functional yet. Categories are currently simple and do not support nested child categories.

## Technologies Used

- **Python** — Programming language
- **Django** — Web framework
- **SQLite** — Database
- **Pillow** — Image-processing library
- **HTML** — Page structure
- **CSS** — Styling and layout
- **JavaScript** — Client-side interactions

## Getting Started

Follow these instructions to run the project locally on Windows.

### Prerequisites

Make sure you have the following installed:

- [Python 3.12.5]
- [Git]

### 1. Clone the Repository

Open PowerShell or a terminal and run:

```powershell
git clone https://github.com/haadi-aamir/Simple-online-store.git
```

Navigate into the project directory:

```powershell
cd Simple-online-store
```

### 2. Create a Virtual Environment

Create a project-specific virtual environment:

```powershell
python -m venv .venv
```

### 3. Activate the Virtual Environment

On Windows PowerShell, run:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, review your execution policy before changing it. Alternatively, activate the environment from Command Prompt using:

```bat
.venv\Scripts\activate.bat
```

### 4. Install Dependencies

Install the packages listed in `requirements.txt`:

```powershell
python -m pip install -r requirements.txt
```

### 5. Apply Database Migrations

Create or update the local database schema:

```powershell
python manage.py migrate
```

### 6. Start the Development Server

Run the Django development server:

```powershell
python manage.py runserver
```

Open the local address shown in the terminal, usually:

```text
http://127.0.0.1:8000/
```

You should now be able to explore the application locally.

## Roadmap

The following features and improvements are planned or remain to be completed.

- [ ] Integrate a payment gateway to support online payments.
- [ ] Implement the currently non-functional sorting buttons.
- [ ] Add support for nested product categories and child categories.
- [ ] Review existing features and improve the overall shopping experience.

## Development Status

This project is a work in progress. Features may be incomplete, and the interface or functionality may change as development continues.

## License

No license has been specified yet. Unless a license is added to the repository, the default copyright rules apply.

