# Sello Saka Foundation

## Project info

**URL**: https://lovable.dev/projects/af524474-d1fc-4118-b6d0-4678358ffdd8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/af524474-d1fc-4118-b6d0-4678358ffdd8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
corepack pnpm install

# Step 4: Start the local app and Convex backend together.
corepack pnpm dev
```

`pnpm dev` starts both Vite and `convex dev`. The legacy frontend Supabase client has been removed from the live runtime path.

If you need the competition ticket PDF flow locally, run Convex and Netlify separately:

```powershell
# Terminal 1
.\node_modules\.bin\convex.cmd dev

# Terminal 2
$env:APPDATA="$PWD\.appdata"
.\node_modules\.bin\netlify.cmd dev --command ".\scripts\dev-vite.cmd"
```

Use `http://localhost:8888` for the Netlify-backed local site when testing ticket PDF downloads. Raw Vite on `http://localhost:8080` does not expose the Netlify PDF function route.

Email PDF attachments are rendered from Convex server actions and therefore require a public URL. Local `localhost` function URLs are intentionally skipped for server-side ticket attachment generation.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Convex

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/af524474-d1fc-4118-b6d0-4678358ffdd8) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
