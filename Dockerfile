FROM node:alpine3.18


RUN addgroup webdriver && adduser -h /home/webdriver -s /bin/sh -G webdriver -D webdriver

WORKDIR /home/webdriver

RUN echo "https://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories
RUN echo "https://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories

RUN apk update && apk add chromium-chromedriver chromium
ENV PATH="/usr/lib/chromium/:${PATH}"
RUN ln -s /usr/lib/chromium/chromium-launcher.sh /usr/local/bin/chrome


COPY . /app
WORKDIR /app

RUN ls -lh


RUN chmod 777 /app;

EXPOSE 8080


CMD node index.js