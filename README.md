# Cadence

Cadence is a full-stack student planner for keeping assignments, projects, exams, and deadlines in one focused workspace. Students can organize work by subject, search and filter their workload, mark work complete, and follow their progress from a responsive dashboard.

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

The seeded demo account is `student@cadence.test` with password `password`.

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
- `/work-items` — searchable and filterable planner
- `/subjects` — color-coded subject management

Cadence uses Laravel's session authentication and email verification. Every subject and work item is scoped to its owner on the server.
