# BloxyFruit Website Documentation

This document is intended for new developers joining the project and serves as a comprehensive guide to understanding, maintaining, and extending the website. It covers the project structure, purpose of each file and directory, details on both the frontend and backend systems, and practical instructions for tasks such as adding new products or modals.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Architecture](#project-architecture)

- [Frontend](#frontend)
- [Backend](#backend)

3. [Routes and Endpoints Overview](#routes-and-endpoints-overview)

- [Public Pages](#public-pages)
- [API Endpoints](#api-endpoints)
- [Claiming Orders Flow Explained](#claiming-orders-flow-explained)

4. [Detailed File and Directory Breakdown](#detailed-file-and-directory-breakdown)

- [Root Files](#root-files)
- [src Directory](#src-directory)
  - [aserver](#aserver)
  - [lib](#lib)

5. [Important Backend Modules](#important-backend-modules)

- [api.server.js](#apiserverjs)
- [mongo.server.js](#mongoserverjs)
- [schemes.server.js](#schemesserverjs)
- [cache.server.js](#cachesserverjs)
- [utils.server.js](#utilsserverjs)
- [hooks.server.js](#hooksserverjs)

6. [Frontend Interactions](#frontend-interactions)

- [app.html & app.css](#apphtml--appcss)
- [lib](#lib)

7. [Adding New Products and Extending Functionality](#adding-new-products-and-extending-functionality)

- [Database & Schema Changes](#database--schema-changes)
- [Product Display and New Components](#product-display-and-new-components)
- [How the Frontend Configuration Affects Product Display](#how-the-frontend-configuration-affects-product-display)
- [Example: Extending Games, Categories, and Rarities](#example-extending-games-categories-and-rarities)

8. [Potential Pitfalls and Best Practices](#potential-pitfalls-and-best-practices)
9. [Workflow and Contributing](#workflow-and-contributing)

---

## 1. Overview

The BloxyFruit website is built on a modern stack combining Svelte (via SvelteKit) with Vite as the bundler and Tailwind CSS for styling. The project integrates a Shopify API for product management and MongoDB for database operations via Mongoose. This documentation provides a deep dive into how the code is organized, where important functionalities live, and how to extend or maintain the system.

---

## 2. Project Architecture

### Frontend

- **Svelte Components:** The user interface is primarily rendered using Svelte. Although explicit page routes may not follow a traditional structure, all UI elements and components are organized within the `src/lib/` directory.
- **Global Files:** `app.html` is the main HTML frame injected by SvelteKit and `app.css` holds global styling directives enhanced by Tailwind CSS.

### Backend

- **Server Module (`src/aserver/`):** Contains API handling, MongoDB connection, schema definitions, caching, and various utility functions.
- **API Integration:** Communicates with Shopify via a dedicated API library for product management, order processing, and inventory updates.
- **Middleware:** Server hooks (`hooks.server.js`) handle session management, cookie handling, and request context enrichment.

---

## 3. Routes and Endpoints Overview

The project follows a file-based routing convention using SvelteKit. Brief overview of the routes and endpoints:

- **Public Pages:**

  - **Landing/Main Page** (`src/routes/(main)/+page.svelte` and `+page.server.js`): Renders the home page. This is the entry point for the website, but also where Shopify redirects after checkout.
  - **Account Pages** (`src/routes/(main)/account/+page.svelte` and `+page.server.js`): Display user account details and order history.
  - **Store Pages** (`src/routes/store/[game]`): List products for each game, with dynamic product cards, filtering, and checkout actions.

- **API Endpoints:**
  - **Orders:**
    - `src/routes/api/orders/claim/+server.js`: Handles order claiming by checking item availability and updating order and inventory statuses.
    - `src/routes/api/orders/details/+server.js`: Fetches detailed order information, enriching order items with account delivery details.
  - **Products:**
    - `src/routes/api/products/+server.js`: Retrieves product information based on game and variant IDs.
  - **Currency:**
    - `src/routes/api/currency/+server.js`: Provides currency conversion rates based on parameters.

### Claiming Orders Flow Explained

The process for claiming orders is implemented in the main page routes:

- **(main)/+page.server.js:**
  - Checks for a `claimOrder` query parameter.
  - If `claimOrder` is present and the user is logged in, the server function retrieves the order and its items.
  - It validates that the item is eligible for account delivery (must be pending and of the correct delivery type).
  - It then updates the inventory item status (from “available” to “claimed”) and marks the order item accordingly.
  - Finally, it redirects the user to the account page where the claimed order details are shown (see the account pages and order details modal).

---

## 4. Detailed File and Directory Breakdown

### Root Files

- **package.json:** Contains project metadata, scripts (ej. `dev`, `build`, `preview`), and lists dependencies (both development and production).
- **bloxyfruit.js:** Serves as an additional entry point or contains project-specific configuration options.

### src Directory

This directory contains all application-specific code.

#### aserver/

Houses server-side code related to API handling, database connections, caching, and utility functions critical for backend operations.

#### lib/

Contains frontend assets including reusable Svelte components, UI elements (modals, navigation, etc.), icons, and various utility files that serve as configuration and helper modules for rendering products and handling user interactions.

---

## 5. Important Backend Modules

### api.server.js

- **Key Functions:**
  - **Shopify Integration:** Configures and uses the Shopify API to fetch and update product information.
  - **Order Processing:** Integrates with MongoDB to manage orders, inventory, and payment verification.
  - **Email Notifications:** Handles email communication for order confirmations and alerts.
- **Caveats:**
  - Changes here impact both order processing and external API integrations; always test extensively.

### mongo.server.js

- **Purpose:** Establishes and manages the connection to MongoDB using Mongoose.
- **Details:**
  - Exports models defined in `schemes.server.js`.

### schemes.server.js

- **Purpose:** Contains MongoDB schema definitions for users, orders, products, inventory, and other entities.
- **Details:**
  - Schemas enforce data consistency; modifications must be coupled with proper database migrations.

### cache.server.js

Implements in-memory caching strategies for frequently accessed data such as product details and user sessions.

### utils.server.js

- **Notable Utilities:** Provides helper functions for periodic tasks and product tag modifications.
- **Impact:** Changes here can influence server-side routines and data transformation.

### hooks.server.js

Acts as middleware for processing incoming requests, managing sessions, and setting global contexts.

> Modifications here affect overall request handling and user authentication.

---

## 6. Frontend Interactions

### app.html & app.css

These files serve as the base HTML template and global style definitions for the site. They set global Tailwind configurations and integrate third-party resources.

### lib/

The `src/lib/` directory houses all the reusable Svelte components and utility functions. Key components include product cards (WholeItem.svelte), navigational elements, and modal dialogs.

---

### Detailed Overview of src/lib

The `src/lib` directory is the heart of the frontend application. It provides:

- **Configuration:** Files like `games.js` define the available games, product categories, and rarities. This configuration dictates how products from Shopify are categorized and displayed.
- **Validation & Schemes:** The `schemes.js` file contains validation schemas for user forms and ensures consistency in input.
- **UI Components:** Components like `WholeItem.svelte` render product cards using data from Shopify, supplemented by configuration from the lib.
- **Styling & Theming:** Files like `colors.js` define color themes used across the site (ej. for denoting product rarity).
- **State Management & Utilities:** The `stores.js` file manages global state (ej. currency and language selections), while `index.js` provides utility functions (ej. lazy loading images, formatting currency, and categorizing products).
- **Modals & UI Elements:** The `modals` directory contains components (such as `multiple-games.svelte`) to handle UI overlays and dialogs for enhanced user interactions.

#### lib/utils/games.js

- **Purpose:** Defines the configuration for supported games such as “Blox Fruits”, “Rivals”, “Pets Go”, “Anime Vanguards”, and “King Legacy.”
- **Details:**
  - Each game configuration includes properties like `shortName`, `name`, `internalName`, a display `order` for different product categories, and `rarities` with a defined color theme.
  - The `products` array, initially empty, gets populated with Shopify product data.

#### lib/schemes.js

- **Purpose:** Provides validation schemas for various user inputs (ej. registration, login, password reset).
- **Details:**
  - Utilizes the `valibot` library to enforce constraints (like minimum and maximum lengths, valid characters, and confirmation checks).
  - Centralizes input validation so that both frontend forms and potential backend checks remain consistent.

#### lib/components/WholeItem.svelte

- **Purpose:** Svelte component responsible for displaying individual product cards.
- **Details:**
  - Uses configuration from `games.js` to determine color themes for different product rarities.
  - Integrates animations, lazy loading of images, and other interactive features to enhance the UX.
  - Connects dynamically with Svelte stores for currency and language formatting.

#### lib/utils/colors.js

- **Purpose:** Defines gradient and solid color schemes used for various product rarities, ensuring a consistent and themed UI.
- **Details:**
  - Each color configuration is mapped to a gradient background and a solid color, facilitating easy style updates and maintenance.

#### lib/utils/stores.js

- **Purpose:** Manages Svelte stores responsible for global state such as language and currency selection.
- **Details:**
  - Provides reactive stores that persist selections in cookies, influencing how data (ej. product prices) are formatted and displayed.

#### lib/utils/index.js

- **Purpose:** Collection of helper functions used throughout the frontend.
- **Details:**
  - Functions for lazy loading images, formatting numbers and currency, and applying animations or transitions.
  - Helps in categorizing products based on configuration from `games.js` and user-driven sorting/filtering options.

#### lib/modals

- **Overview:** Contains Svelte components responsible for rendering modals (ej. multiple-games modal for cart errors).
- **Details:**
  - These modals provide user feedback on cart operations and ensure that game-specific products are not mixed unintentionally.

---

## 7. Adding New Products and Extending Functionality

This section offers a detailed guide on how new products are integrated and how the frontend logic in `src/lib` impacts overall product display and categorization.

### Database & Schema Changes

- **Product Schema Updates:**
  - Even though the product details (ej. title, price, image) are sourced from Shopify, key attributes such as category, rarity, and game association need to also be defined in the configuration files in `src/lib/utils/games.js`.
  - When adding new fields or modifying existing ones, update the schema in `schemes.server.js` (backend) and, if necessary, the Shopify integration logic in `api.server.js`.

### Product Display and New Components

- **Frontend Components:**
  - **WholeItem.svelte:** This component displays product information including pricing and animated interactions. Changes to product display (such as showing new fields) should be handled here.
  - **Supporting Utilities:**
    - `colors.js` defines thematic color schemes.
    - `index.js` provides utilities for formatting and categorizing products.
    - Svelte stores (`stores.js`) manage global state (ej. currency conversion).
- **Usage of Shopify Data:**
  - Although Shopify supplies essential product data, the categorization (by game, rarity, etc.) is handled by the configuration in `games.js` as well. This means that adding a new game or modifying existing product displays requires changes in the lib configuration.

### How the Frontend Configuration Affects Product Display

- **Games and Categories (games.js):**
  - Define new games or adjust existing ones by updating the game objects. Each game configuration includes the display order, available product categories, and rarity settings.
- **Rarities and Themes (colors.js):**
  - Update or add color schemes to ensure new rarities are displayed correctly.
- **Validation (schemes.js):**
  - Adapt form validation when new product information or metadata needs to be captured from users.

### Example: Extending Games, Categories, and Rarities

Since products along with metadata are all derived from Shopify, we just need to define the base structure to connect this new data to the site.

1. **Adding a New Game:**

   - Open `src/lib/utils/games.js`.
   - Add a new game object with the following properties:
     - `shortName`: A concise abbreviation.
     - `name`: The full game name.
     - `internalName`: A unique identifier.
     - `order`: An array defining the display order for product types (Categories set in Shopify).
     - `rarities`: Define rarity levels with names and associated color keys matching those in `colors.js`.
     - `products`: Initially an empty array; populated later via Shopify integration.

2. **Updating Product Components:**

   - If new product properties are added, modify `WholeItem.svelte` to render the additional information. Leverage Svelte stores (from `stores.js`) and utility functions (from `index.js`) to maintain consistency.

3. **Testing and Validation:**
   - After making changes, perform thorough testing:
     - Validate that products are correctly categorized according to the new game configuration.
     - Ensure that UI components correctly display updated information.
     - Confirm that form validations in `schemes.js` continue to enforce the expected rules.

Using these guidelines, basically anyone can extend product functionality effectively while ensuring consistency across both frontend displays and backend integrations.

> If you end up adding new game support, please check the Discord Bot's code to ensure that it is also able to support tickets for new games as well.

---

## 8. Potential Pitfalls and Best Practices

- **Environment Variables:**
  - Avoid hard-coding sensitive credentials; always utilize secure sources like `.env` files.
- **Database Schema Updates:**
  - Backup your data and test changes in a staging environment before deploying schema updates.
- **Caching Considerations:**
  - Be cautious when updating caching logic in `cache.server.js` to prevent data serving issues.
- **UI Consistency:**
  - Follow Tailwind CSS design tokens and established class conventions when modifying or adding Svelte components.
- **Version Control and Branching:**
  - Employ meaningful branch names and commit messages, following the project's branching strategy.

---

## 9. Workflow and Contributing

- **Branching Strategy:**
  - Use `feature/[feature-name]` for new functionalities and `fix/[bug-number]` for bug fixes.
- **Code Reviews:**
  - All changes—especially those affecting backend modules or UI components—should undergo thorough review for consistency and security.
- **Testing:**
  - Run local development servers (`npm run dev`) and perform integration testing for both frontend and backend changes.
- **Documentation Maintenance:**
  - Update this README and related technical documentation as major changes occur in the project architecture or feature set.
