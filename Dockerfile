#use a light image from node
FROM node:20-alpine As build

#create the directory in container
WORKDIR /usr/src/app

#Copy the dependences files
COPY package*.json ./
COPY prisma ./prisma/

#install all dependences (includes dev dependences)
RUN npm ci

#Copy the source code
COPY . .

#Generate the prisma client
RUN npx prisma generate

#compile the project
RUN npm run build

#Start with a new and light image
FROM node:20-alpine AS production

WORKDIR /usr/src/app

#Copy only the necessary files from the previous step
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma

#run with the flag
RUN npm ci --only=production

#new prisma client
RUN npx prisma generate

#light dist
COPY --from=build /usr/src/app/dist ./dist

#define the envirement variables
ENV NODE_ENV production

#expose on 3000
EXPOSE 3000

#cmd to start the aplication in production
CMD [ "node", "dist/main.js" ]