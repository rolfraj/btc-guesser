# Bitcoin Price Guess App

This is a web application built with Next.js and Supabase that allows users to guess whether the market price of Bitcoin (BTC/USD) will be higher or lower after one minute.

## Functionality

-   **Real-time BTC Price:** The app displays the latest BTC/USD price fetched from the CoinDesk API.
-   **Score Tracking:** Users have a score that is persisted in a Supabase database.
-   **Guessing:** Users can guess "up" or "down" for the BTC price movement.
-   **Guess Resolution:** After a guess is made and 60 seconds have passed, the guess is resolved, and the score is updated accordingly.
-   **Persistence:** User scores are persisted, allowing users to return and continue playing.

## Setup

1.  **Clone the Repository:**
    ```bash
    git clone YOUR_REPOSITORY_URL
    cd nextjs-bitcoin-guess
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Supabase:**
    -   Create a Supabase project.
    -   Create a table named `players` with columns
        - `id` (UUID, primary key)
        - `score` (integer).
        - `created_at` timestamp
        - `updated_at` timestamp
    -   Obtain your Supabase URL and anonymous key.
4.  **Configure Environment Variables:**
    -   Create a `.env.local` file in the root directory.
    -   Add your Supabase URL and anonymous key:
        ```
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

        NEXT_PUBLIC_BTC_PRICE_API='https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        ```
5.  **Run the Application:**
    ```bash
    npm run dev
    ```
    -   Open your browser and navigate to `http://localhost:3000`.
6. **Deploy to Vercel**
    - Create a Vercel Account and link your github repo.
    - Add the environment variables to the vercel project.
    - Vercel will build and deploy the application.

## Deployment

1.  **Vercel:**
    -   Connect your GitHub repository to Vercel.
    -   Vercel will automatically build and deploy your application.
    -   Add your Supabase environment variables to your Vercel project settings.
2.  **Supabase:**
    -   Ensure your Supabase project is running and accessible.

## Testing

-   Manual testing can be performed by making guesses and observing the score changes.
-   Unit tests and integration tests can be added using Jest and React Testing Library for more comprehensive testing.

## Notes

-   The BTC price is fetched from the CoinDesk API, which may have rate limits.
-   Error handling is implemented to catch and display errors.
-   The player id is saved to localStorage, so the user can return to the page and keep their score.