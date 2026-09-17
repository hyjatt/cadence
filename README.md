# Cadence

Cadence is a full-stack planner for keeping tasks, priorities, and deadlines in one focused workspace. Anyone can organize work, home life, health, personal projects, and more with optional categories, reusable tags, and a responsive progress dashboard.

## Stack

- Laravel 13 and PHP 8.4
- React 19, TypeScript, and Inertia 3
- Tailwind CSS 4 and Vite
- MySQL 8+

## Local setup

Requirements: PHP 8.3+, Composer, Node.js 22+, npm, and MySQL 8+.

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Create the application and test databases, then update the MySQL credentials in `.env`:

```sql
CREATE DATABASE cadence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE cadence_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Finish setup and start both development servers:

```bash
php artisan migrate --seed
composer dev
```

The local seeded demo account is `avery@cadence.test` with password `password`.

## Quality checks

```bash
composer test
npm run check
npm run types:check
npm run build
```

The GitHub Actions workflow runs the backend and frontend checks using MySQL on every push to `main` and on pull requests.

## Core routes

- `/` — public landing page
- `/dashboard` — progress and upcoming deadlines
- `/tasks` — searchable and filterable task planner
- `/categories` — optional color-coded category management

Cadence uses Laravel's session authentication and email verification. Every category, tag, and task is scoped to its owner on the server.
