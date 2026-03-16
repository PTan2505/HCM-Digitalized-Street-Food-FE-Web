# GitHub Copilot Instructions

## Project Overview

This is a React 19 + TypeScript SPA for the **HCM Digitalized Street Food** platform. It serves four user roles: `USER`, `VENDOR`, `MODERATOR`, and `ADMIN` (numeric values `0–3` from `src/constants/role.ts`).

**Package manager:** Bun (`bun install`, `bun run <script>`). Never use `npm` or `yarn`.

---

## Tech Stack

| Category      | Technology                                                    |
| ------------- | ------------------------------------------------------------- |
| Framework     | React 19 + TypeScript 5.8                                     |
| Build tool    | Vite 7                                                        |
| Routing       | React Router 7 (`createBrowserRouter`)                        |
| State         | Redux Toolkit 2 + React Redux 9                               |
| HTTP          | Axios 1 with interceptors                                     |
| UI            | MUI 7 + Tailwind CSS 4 + Emotion 11                           |
| Forms         | React Hook Form 7 + Zod 4                                     |
| Notifications | react-toastify 11                                             |
| Icons         | `@heroicons/react`, `@mui/icons-material`, `lucide-react`     |
| Auth          | Google OAuth (`@react-oauth/google`), Facebook SDK, Phone+OTP |

---

## Project Structure

```
src/
├── app/            # Router, store, provider, role-based layout guards
│   └── routes/     # RootLayout, AdminLayout, VendorLayout, ModeratorLayout
├── features/       # Feature modules (auth, admin, moderator, vendor, user, home)
│   └── <feature>/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── api/
│       └── types/
├── components/     # Shared/reusable components only
├── lib/
│   └── api/        # ApiClient class, apiInstance registry, apiUrl constants
├── config/         # axiosApiService.ts, muiTheme.ts
├── slices/         # Redux slices (auth.ts, vendor.ts, badge.ts, …)
├── hooks/          # reduxHooks.ts (typed dispatch/selector), useUser.tsx
├── utils/          # tokenManagement.ts
├── types/          # Shared TypeScript interfaces (user.ts, apiResponse.ts)
└── constants/      # routes.ts, role.ts, errorMessage.ts, adminTheme.ts
```

---

## File Naming Conventions

| Category    | Convention                                        | Example                       |
| ----------- | ------------------------------------------------- | ----------------------------- |
| Components  | `PascalCase.tsx`                                  | `CustomInput.tsx`             |
| Pages       | `PascalCase` + `Page` suffix                      | `LoginPage.tsx`               |
| Layouts     | `PascalCase` + `Layout` suffix                    | `AdminLayout.tsx`             |
| Hooks       | `camelCase` + `use` prefix                        | `useLogin.tsx`                |
| Slices      | `camelCase`                                       | `auth.ts`, `vendor.ts`        |
| API classes | `camelCase` + `Api` suffix                        | `loginApi.ts`, `vendorApi.ts` |
| Types       | `camelCase`                                       | `user.ts`, `apiResponse.ts`   |
| Constants   | `camelCase` filenames, `UPPER_SNAKE_CASE` exports | `routes.ts` → `ROUTES`        |

---

## Path Aliases

Always use path aliases. Never use relative `../../` imports that cross feature or layer boundaries.

| Alias             | Resolves to           |
| ----------------- | --------------------- |
| `@app/*`          | `src/app/*`           |
| `@components/*`   | `src/components/*`    |
| `@features/*`     | `src/features/*`      |
| `@auth/*`         | `src/features/auth/*` |
| `@user/*`         | `src/features/user/*` |
| `@slices/*`       | `src/slices/*`        |
| `@hooks/*`        | `src/hooks/*`         |
| `@utils/*`        | `src/utils/*`         |
| `@config/*`       | `src/config/*`        |
| `@constants/*`    | `src/constants/*`     |
| `@lib/*`          | `src/lib/*`           |
| `@custom-types/*` | `src/types/*`         |
| `@assets/*`       | `src/assets/*`        |

---

## Import Boundary Rules (enforced by ESLint)

- `features/` **cannot** import from `app/`
- `components/`, `hooks/`, `utils/`, `config/`, `constants/` **cannot** import from `features/` or `app/`
- Features **cannot** import from sibling features (keep features isolated)

---

## API Layer

Three-layer pattern — always follow this:

1. **`AxiosApiService`** (`config/axiosApiService.ts`) — raw Axios instance with auth token injection and toast interceptors. Do not instantiate directly in features.
2. **`ApiClient`** (`lib/api/apiClient.ts`) — typed `get/post/put/patch/delete` methods. Do not use directly in components.
3. **Feature API classes** (e.g., `features/auth/api/loginApi.ts`) — consume `ApiClient` via `axiosApi` singleton from `lib/api/apiInstance.ts`. Use URL constants from `lib/api/apiUrl.ts`.

```ts
// ✅ Correct: access via the singleton registry
import { axiosApi } from '@lib/api/apiInstance';

class MyFeatureApi {
  async getItems() {
    return axiosApi.myFeature.get<Item[]>(API_URLS.MY_FEATURE.LIST);
  }
}
```

All new API URL constants go in `src/lib/api/apiUrl.ts`. All new API instances are registered in `src/lib/api/apiInstance.ts`.

---

## State Management

- All global state lives in `src/slices/`. Use Redux Toolkit `createSlice`.
- All async operations use `createAppAsyncThunk` from `@hooks/reduxHooks` (not the plain RTK version).
- Use typed hooks everywhere: `useAppDispatch` and `useAppSelector` from `@hooks/reduxHooks`.
- Selectors are co-located in the slice file (e.g., `export const selectUser = (state: RootState) => state.user`).
- Use `addMatcher` with `isPending`/`isFulfilled`/`isRejected` for shared loading/error state.

```ts
// ✅ Correct
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
const dispatch = useAppDispatch();
const user = useAppSelector(selectUser);
```

---

## Styling

- Use **Tailwind CSS 4** utility classes as the primary styling approach.
- Custom typography classes are defined in `src/index.css` (e.g., `title-xl`, `body-medium`). Use them instead of ad-hoc font-size utilities.
- Use **MUI components** for complex UI elements (forms, dialogs, tables, navigation). Apply MUI's `sx` prop for MUI-specific overrides.
- Tailwind class order is auto-sorted by `prettier-plugin-tailwindcss` on save — do not manually reorder.
- Use `clsx` for conditional classnames, never string concatenation.
- The MUI custom theme is in `src/config/muiTheme.ts`. Extend the theme there — do not override theme tokens inline.

---

## Forms

- All forms use **React Hook Form** + **Zod** schemas.
- Define the Zod schema in the same file as the hook or in a sibling `schema.ts`.
- Use the shared `CustomInput` component from `@components/CustomInput` for standard text inputs (it is pre-wired for React Hook Form).
- Always use `@hookform/resolvers/zod` as the resolver.

```ts
const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;
const { register, handleSubmit } = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

---

## Authentication & Routing

- Route definitions live in `src/app/router.tsx`.
- Role-based layout guards: `RootLayout` (detects role and redirects), `AdminLayout`, `ModeratorLayout`, `VendorLayout`.
- All route path strings are defined as constants in `src/constants/routes.ts` (`ROUTES`). Never hardcode path strings.
- Auth tokens are managed exclusively via the `TokenManagement` class in `src/utils/tokenManagement.ts`. Never read/write `localStorage` for tokens directly.
- On app boot, `RootLayout` dispatches `loadUserFromStorage()` which validates the stored token and hydrates the Redux `user` slice.

---

## Error Messages

- User-facing error messages are stored in `src/constants/errorMessage.ts` as key→string maps (in Vietnamese).
- Map API error codes to these constants. Do not hardcode message strings in components.

---

## Environment Variables

All env vars are `VITE_` prefixed and accessed via `import.meta.env.VITE_*`.

| Variable                | Purpose                |
| ----------------------- | ---------------------- |
| `VITE_API_URL`          | Backend API base URL   |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `VITE_FACEBOOK_APP_ID`  | Facebook OAuth app ID  |

Use `.env.example` as the source of truth. Never commit `.env` files.

---

## TypeScript

- TypeScript strict mode is on. No `any` is allowed (`no-explicit-any: error`).
- Use `unknown` and type narrowing instead of `any`.
- Prefer `nullish coalescing` (`??`) over `||` for nullable values (`prefer-nullish-coalescing: error`).
- Use optional chaining (`?.`) wherever possible (`prefer-optional-chain: error`).
- All functions should have explicit return types (`explicit-function-return-type: warn`).
- Shared response types: `BackendResponse<T>`, `ApiResponse<T>`, `APIErrorResponse` from `@custom-types/apiResponse`.

---

## Code Quality Rules

- Format with **Prettier** (single quotes, 2-space indent, trailing commas `es5`, `printWidth: 80`).
- Lint with **ESLint 9** flat config (`eslint.config.js`). All CI checks must pass.
- Run before pushing:
  ```bash
  bun run type-check   # tsc --noEmit
  bun run lint         # eslint
  bunx prettier --check "src/**/*.{ts,tsx,css}"
  bun run build        # full production build
  ```

---

## CI/CD

GitHub Actions workflow (`.github/workflows/pr-checks.yml`) runs on PRs/pushes to `main` and `dev`:

- Type check (`tsc --noEmit`)
- ESLint
- Prettier format check
- Full production build (`vite build`)

All checks must pass before merging.

---

## Key Patterns to Follow

1. **Feature isolation** — each feature in `src/features/<name>/` manages its own components, pages, hooks, and API calls.
2. **No direct Axios usage in components** — always go through the API class layer.
3. **No direct `localStorage` access** — use `TokenManagement` for tokens.
4. **No hardcoded route strings** — use `ROUTES` constants.
5. **No hardcoded role numbers** — use `ROLES` constants from `@constants/role`.
6. **Typed Redux** — always use `useAppDispatch`/`useAppSelector` and `createAppAsyncThunk`.
