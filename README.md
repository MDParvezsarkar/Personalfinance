# Parvez Money Manager

A privacy-first personal + family + business money manager for BDT. The current release is a client-side app using localStorage so it runs without a server or bank connection.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Financial rules

- Transfers are not income or expenses.
- Credit-card purchases increase expense and card liability.
- Credit-card payments move money from a bank/cash account to the card liability; they are not another expense.
- Debt payments reduce debt principal.
- Net worth = liquid assets - credit-card liabilities - other debts.

## Data

The app stores data locally in the browser under `parvez-money-manager-v1`. Data survives refreshes in the same browser profile and at the same site address. It is not synchronized to GitHub or another device, and may be lost if browser site data is cleared.

The local development address and GitHub Pages address use separate browser storage. Before moving to the deployed site, download a backup in Settings, then restore it after opening the deployed site. Keep financial backups private and do not commit them to this public repository.

## GitHub

The repository is configured for GitHub Pages at `https://mdparvezsarkar.github.io/Personalfinance/`. Push the project to the `main` branch to run the Pages deployment workflow. In the repository's **Settings → Pages**, set the build and deployment source to **GitHub Actions**. The workflow builds the app and publishes the generated `dist/` folder.

Do not commit `.env` files or real financial exports. GitHub Pages hosts only the static app; it does not provide a private finance database or cloud sync.
