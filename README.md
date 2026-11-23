# shadcn/ui monorepo template

This is a Vite monorepo template with shadcn/ui.

## Menjalankan hasil build frontend

Dari root workspace:

```bash
pnpm build
pnpm start
```

`start` menjalankan hasil build ketiga aplikasi: internal di `http://localhost:5173`, exam di `http://localhost:5174`, dan candidate di `http://localhost:5175`. Jika hanya memerlukan satu aplikasi, gunakan `pnpm start:internal`, `pnpm start:exam`, atau `pnpm start:candidate` setelah menjalankan build aplikasinya. Perubahan variabel `VITE_*` memerlukan build ulang.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```
