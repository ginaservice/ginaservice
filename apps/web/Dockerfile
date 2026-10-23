FROM node:20-alpine AS base
RUN npm install -g pnpm@9.0.0
WORKDIR /app

FROM base AS build
COPY package.json ./
RUN pnpm install
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3100
CMD ["nginx", "-g", "daemon off;"]
