FROM node:20-alpine As build

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma

RUN npm ci --only=production

COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /usr/src/app/dist ./dist

ENV NODE_ENV production

EXPOSE 3000

CMD ["/bin/sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]