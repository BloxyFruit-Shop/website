# Shopify Setup Guide for Bloxypoints

This guide explains how to create and configure Shopify products for the new Bloxypoints payment flow.

## Overview

Instead of custom amounts, we now sell fixed packs of Bloxypoints (e.g., 400, 800, 1700, 4500, 10000 BP). Each pack corresponds to a standard Shopify product.

## Step-by-Step Instructions

### 1. Create a New Product

1.  Log in to your Shopify Admin dashboard.
2.  Go to **Products** and click **Add product**.
3.  **Title**: Enter a clear name, e.g., "400 Bloxypoints".
4.  **Description**: (Optional) Add a description like "Get 400 Bloxypoints instantly."
5.  **Media**: Upload an image for the pack.
6.  **Pricing**: Set the price for the pack (e.g., $4.99).

### 2. Configure Product Tags (CRITICAL)

The system uses **Tags** to identify these products and know how many points to give.

1.  Scroll down to the **Product organization** section on the right sidebar.
2.  In the **Tags** field, add the following tags exactly as written:
    *   `deliveryType:bloxypoints` (This tells the system it's a Bloxypoints pack)
    *   `robuxAmount:400` (Replace `400` with the actual amount of points for this pack)
    *   `game:bloxypoints` (Optional, helps with organization)

> [!IMPORTANT]
> The `robuxAmount` tag MUST match the amount of points you want to give. For example, for a 10,000 BP pack, use `robuxAmount:10000`.

### 3. Inventory and Shipping

1.  **Inventory**: You can set it to "Don't track inventory" since these are digital items, or set a high stock number if you want to limit them.
2.  **Shipping**: Uncheck "This is a physical product". This ensures no shipping address is required at checkout (though Shopify might still ask for billing address).

### 4. Product Status

1.  Set **Status** to **Active**.
2.  Ensure **Storefront** is selected in Publishing channels.

### 5. Repeat for All Packs

Repeat these steps for every pack size you want to sell (400, 800, 1700, 4500, 10000, etc.).

### 6. Create the Collection (CRITICAL)

The system needs a collection to find these products.

1.  Go to **Products** > **Collections**.
2.  Click **Create collection**.
3.  **Title**: Enter `Bloxypoints` (must match exactly, case-insensitive usually but best to match).
4.  **Collection type**: Select **Automated**.
5.  **Conditions**:
    *   Select **Product tag** is equal to `game:bloxypoints`.
    *   (Alternatively, you can use `deliveryType:bloxypoints` if you tagged them with that).
6.  **Publishing**: Ensure it is available to the **Storefront** channel.
7.  Click **Save**.

## Verification

To verify your setup:
1.  Go to the `/bloxypoints` page on your website.
2.  You should see the new packs displayed.
3.  The price and amount should match what you configured in Shopify.

## Troubleshooting

*   **Product not showing up?**
    *   Check if the status is **Active**.
    *   Check if it's available to the **Storefront** channel.
    *   Verify the `game:bloxypoints` tag is present.
    *   **Verify the Collection exists** and contains the products.
*   **Wrong amount credited?**
    *   Double-check the `robuxAmount:<NUMBER>` tag. Ensure there are no spaces or typos.
