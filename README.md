<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Pizzapp

API application done with NestJS and Typescript for Dormakaba's interview code challenge.

This API will let people to order pizzas and Admins to create/modify data.

## Use cases

Not admin users (sign up customers) have not use cases for the MVP but it is prepared for future evolutive changes.

![](http://www.plantuml.com/plantuml/png/VO-n2i8m48RtFCMDTYZPCqYb5H74YbgTWpbAmAIGIn3wz5vIePjJSd---tBNKDGX9lSMgaqK9uT1WIPu9H9ge5-L-2BKpZZhIwsD4u8HgBl-UQwti7bO_C35phCcMOwRdP7aqOy1ZKKVgLeQc6q3weYWFVJ1OAY4oFxLTTZVGUQ8fCDgUSpvQHgjPvf_N-0rB5bnNuUkQBdvxpWoByT3DUWDh_y5)

<small>Created with PLANTUML, code at the next [link](http://www.plantuml.com/plantuml/uml/VO-n2i8m48RtFCMDTYZPCqYb5H74YbgTWpbAmAIGIn3wz5vIePjJSd---tBNKDGX9lSMgaqK9uT1WIPu9H9ge5-L-2BKpZZhIwsD4u8HgBl-UQwti7bO_C35phCcMOwRdP7aqOy1ZKKVgLeQc6q3weYWFVJ1OAY4oFxLTTZVGUQ8fCDgUSpvQHgjPvf_N-0rB5bnNuUkQBdvxpWoByT3DUWDh_y5).</small>

## Models

The business interfaces and entities are described at the next image:

![](http://www.plantuml.com/plantuml/png/XLCzRzim4DtrAxHvAj2FZLDIMGc4gh9X8rcA3ZHvjG-LA8575OcB_lSUgO2c8nXQ1BvtvBjtZzGTEMdTsBKP68VkDNyYiFdVBCzHYvoSHNDaO6G72OHEOflWawHJ0ctVWWXAErvb_p8M7xj81FcdVRaJ-MfaRiNmVlszQXXBtQ5PXIEJdyeSBMXajEWAwR4T7PW72qmVUcubJU2RqSt9MYhN4ymB3qYdEViCH-2iK9ePVqtHWEgrXZ_02V7O1x1CmekpScjHGIGlCsxnV9PxFCFYYCgVwC21fKHyyBgLKLlbRgalXnTp9f64_kCdrmwIKCtCes4RlwI2gSF6wkdb31w9YSocmQlRuiHZYqi2VFnsdw_I_2warM4OnOicR4eVvik05jRIiOB_CaMWBBYuvqgm6CdrdRUz_CQ7Ks_IkjJQ0b727DxiYMWqkOKfdjajg3S78dhnhMAU999mmrre9DMFnhs__WIJy_DF7VUyZdzWGWKdnNrJb7LThaN-uHFZNLcKrRE77trri_bMDOyYzwLrMNDb5_3d2_PxltZvEp1wxDh_)

<small>Created with PLANTUML, code at the next [link](http://www.plantuml.com/plantuml/uml/XL9DRzim3BtdL-Wdx6CddTevRc7CSu84wMNOGP6vH9Wi6oGzjDdstqVPdQFK2789yXwfHpu-tn4RvBxn2mZi-4KLuO1GEq7gzq8fLsj5Z2uS10JJG08TFVgU8JmW2BrlMmyc37pLyvmiZUMMO5vuS7ISiqzm03ReJ9ZnbnHrphwKy0kyLg5lze12mZEZMQEpC95_5_yzhjtfPBRk13SjslYY0GQaHBoBkaMmQylNr6yVRxepwUJetxvBRM_8sTdoBZ3W3sDXdB326Z2EwIBI8xaOZHVNnKbiw_C5vFdrEPzD-9aPh0SpLlvKGrFY0fuxXx0qB0hnLoW2Yy1JpuLWrXEtJLnxVX1eZFC9xevjIEkchX684cR_kfu-B_f7V7W_Xj4tQhZHbWsFIM_oB2-UygLMxmHbgzMNedhKwhs0PLvAPJFW3sSSUp_6tligoyiomaz9r8F-F6hxQbDFXeKSOYATX3TaNJkoRH_uxUULO8e6T69cyhSZm4thHtUxRRuPdTqllnQL-4estT5iqTiH70qT4uWoIKypHVmEGjqt_Xy0).</small>

## Requirements to use the app locally

- [Node.js](https://nodejs.org/es/)

- [Yarn](https://yarnpkg.com/) (Chosen package manager)

- [Docker](https://www.docker.com/)

To run the app, the environment is prepared to run the Nestjs application in the local machine and two Mongodb servers in the Docker containers, one database is for development and the other for end to end testing.

## Environment variables

Files with required environment variables have been provided (files `.env` and `.test.env`).

In a real application that environment variables would not be added to the repository and keep them secret.

Default environment variables will require `localhost` to have free the ports `3000` for the app, `27017` for the mongodb server at production and `27018` for the mongodb server at testing.

## Start

To start the app first install the dependencies:

```shell
yarn install
```

Start the database server:

```shell
yarn up:db
```

Build the app:

```shell
yarn build
```

And start as production or development:

```shell
yarn start:prod
#or
yarn start
```

## Fixtures

As the database is "real", once it is created with Docker it will not have any data to show. For that reason and for the exercise purposes, it is provided a public endpoint to reset all the database and populate it, so it can be tested with some data.

Make a request to:

```
GET /fixtures
```

## API Documentation

API documentation have been done with Postman and can be found at the next [link](https://documenter.getpostman.com/view/14255685/VUjTj2q2).

It is also provided a `.json` with all the Postman Collection used. Take into account that the environment variables could not be exported to that `.json` but all of them are filled with Postman scripts (except `host` variable).

## Testing

The testing had been done with an end to end focus so a database with testing purposes must be provided. This is handled by the command if you have Docker Engine running.

To run the tests:

```shell
yarn test
```

This command does:

- Restarts the testing database image.

- Run the tests with one thread to avoid unexpected data at the database between tests.

- Removes the testing database image.

## Commands

All other commands can be found at the `package.json`.
