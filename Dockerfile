FROM node:18 as builder

WORKDIR /app

COPY config ./config/
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

FROM node:18

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/config ./config
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD [  "npm", "run", "start:migrate" ]



