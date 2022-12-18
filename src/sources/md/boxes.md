# BoxesApp

## Description

<div class="flex">
<div class="w-30 contain dark" id="boxes-logo">
</div>
<div class="w-70">

[BoxesApp](https://boxesapp.nz "BoxesApp Documentation") provides
administration and client interfaces for selling items grouped together in a
box. As detailed below it was first and foremost developed to sell and deliver
boxes of organic vegetables, but there is no reason why it couldn't be used to
sell any type of widget in a box.

</div>
</div>

<div class="horizontal-rule"></div>

<div class="fl w-100 w-60-m w-70-l">

[BoxesApp](https://boxesapp.nz "BoxesApp") is not a standalone online shopping
service, it integrates with a [Shopify](https://www.shopify.com "Shopify")
store and both the container box and the included items are actual store
products. The screenshot of the client interface is from [Streamside
Organics](https://www.streamsideorganics.co.nz "Streamside Organics") who grow
and market organic vegetables. The subscription option itself is an integration
with an established subscription service by [Recharge
Payments](https://rechargepayments.com/ecommerce/shopify-subscriptions
"Recharge Payments")

Each week the boxes can be updated by the store owner with products according
to season and harvest. At [Streamside
Organics](https://www.streamsideorganics.co.nz "Streamside Organics") they
offer [small, medium, and large
boxes](https://www.streamsideorganics.co.nz/collections/veggie-boxes-1 "Shop
Veggie Boxes") and are currently delivering close to 200 boxes per week. The
customer may **swap** out products for another item from a list of available
products, and are able to **add** items into the box from the same list. They
may also change the quantity of any item in the box.

A [custom](https://www.streamsideorganics.co.nz/products/custom-box "Custom
Box") box is also offered which has no included items and the customer can
*build* their box from the list of available products.

</div>
<div class="fl w-100 w-40-m w-30-l pl3-ns tc tl-ns">
<img src="screenshot-client.png"
  title="Screenshot of client interface from web"
  alt="Screenshot of client interface from web" />
</div>
<div class="cf"></div>

## The Story

### First Aotearoa Lockdown

With the spread of the novel SARS-CoV-2 virus Aotearoa went into its first
nationwide lockdown on the 25 March 2020. At the time [Streamside
Organics](https://www.streamsideorganics.co.nz) (then operating as Spring
Collective) was using [BuckyBox](https://www.buckybox.com/) to sell and market
their vegetable boxes.  They had around 30-40 box customers, some
on a [Community Supported
Agriculture](https://www.nal.usda.gov/farms-and-agricultural-production-systems/community-supported-agriculture)
type scheme, and others paying weekly. For that first lockdown the rapid uptick
in customers meant that the site struggled to cope. Furthermore, at the time,
BuckyBox was indicating that it would cease to operate at the end of 2020 (that
hasn't come about as it happens). Looking for another way to market their boxes
online to a locked down population, [Streamside
Organics](https://www.streamsideorganics.co.nz) signed up for a
[Shopify](https://www.shopify.com) store and started adding products.

### Getting Started

However, a [Shopify](https://www.shopify.com) store cannot offer the sort
functionality that [BuckyBox](https://www.buckybox.com/) offers. To be
effective the store needed to allow:

* exclusions and substitutes
* extra items
* selected delivery days
* easy weekly editing of products in boxes
* compilation of picking and packing lists from the orders
* data format for printing labels for the boxes

Most, but not all, of these requirements could be met using a stock standard
store but required a lot of admin time. I think that
[Shopify](https://www.shopify.com) is a fully featured web commerce software
platform; furthermore, apps can be built on top of the extensive api that comes
with the platform. Third party apps can add features and deliver unique
customer experiences.

At the time I was working on the farm with the harvesting crew. With a
background that includes a good deal of coding, and a desire to help, I put my
hand up.

### Building A Shopify App

Broadly speaking the technical requirements of a Shopify App encompass the
entire depth of a computer system application, and straddles two separate web
development domains; the front end and the back end. In the case of
[BoxesApp](https://boxesapp.nz") the front end has two parts, that for the
customer can be seen in the screenshot above, and another is needed for
administration of the boxes. For the back end a database and a web server are
required, webhooks need to be registered to collect orders from the store, emails
will need to be sent, etc.

### Decisions

My first decision was the most basic - which coding language to use? Most of my
back end coding experience was with [Python](https://python.org). I spent a
couple of years working on a [Zope](https://www.zope.dev/) application in the
first years of the century, following that I worked on numerous
[Django](https://www.djangoproject.com/) projects with
[Encode](https://encode.nz/). However, since its beginnings in 2009
[NodeJS](https://nodejs.org/) has grown in popularity as a runtime server
environment, and the idea of using the same coding language for both front and
back end development appealed to me.

The second decision was regarding the database. I am familiar with
[PostgreSQL](https://www.postgresql.org/) (the database of choice for Django
applications) so I began with that. But I recalled the ease of using the Zope
object database and so soon switched to [MongoDB](https://www.mongodb.com/), a
decision I do not regret.

My third major decision was how to build the front end. I'd been messing with
[DHTML](https://en.wikipedia.org/wiki/Dynamic_HTML) since around 1999 and I had
been playing with [React](https://reactjs.org/) in recent years. React is used
by Shopify and most Shopify app development articles focused on React, so React
was used in my first explorations. But I don't actually like React (apologies
to all aficionados) so when I came across [Crank](https://crank.js.org/) it was
with great relief and a breath of fresh air. Discarding React for Crank has the
added advantage of greatly diminished asset file size. Crank was only
[introduced](https://crank.js.org/blog/) in April 2020 so it was brand new at the
time; my gut feeling has paid off for me. Thank you Brian Kim.

Settling on a build/bundle management tool also took me some thought and
experimentation, and a bit of grief on the way. Without running through all of
the alternatives that I tried to use, I'll just say that I settled on
[Vite](https://vitejs.dev/) and 2½ years in I could not recommend it highly
enough for its ease of use and sensible defaults.

The final noteworthy decision was one of deployment. I did try out a couple of
cloud options but (and this may well be my lack of experience) frankly they did
not pan out too well for me. So I went back to being my own sysadmin and using
a virtual private server from [Rimuhosting](https://rimuhosting.com/) with whom
I've been a customer since 2004 (excepting the years 2018-2020 after solemnly swearing
that I'd never code again).

### The Work

I began the work in my own time, evenings and weekends. As pressure built to
get it up and working I was given some paid time to work on the application.
Then I took several weeks unpaid leave to finally get an initial version
working. I did not keep good records of the time spent but by then it was
certainly running up over a hundred hours. Finally though, I did have it
running in production and during lockdowns the farm was sending out close to
400 boxes a week.

As the end of 2020 approached, BuckyBox was expected to shut down and it was
apparent that I needed to duplicate the **subscription** functionality of
BuckyBox.  Shopify itself did not support subscriptions at the time, though did
introduce a subscription api in early 2021. So in September/October 2020, I was
pouring my spare time into building a subscription solution for BoxesApp.
Streamside is a small business and cannot feasibly invest money into software
development, particularly as I was unable to make an estimate of the time to
complete the task. But I had made a commitment. They proposed to me that I
should charge them a monthly fee for the app, which must cover my server costs,
maintenance, upgrades, and feature requests. I really only had two choices, 1.
accept the proposal or, 2. withdraw my support. Because of my personal sense of
obligation the second option was out of the question.

### Subscription App

Below is a screenshot of how I duplicated the BuckyBox functionality as a
separate but integrated application. It requires an amount of manual
administration effort from Streamside. Either:

1. Take a payment for a set number of weeks, create and insert a subscription
   for the customer, or
2. upload a bank statement and BoxesApp reconciles payments against
   subscriptions to generate the box order.

![Subscriptions](subscription.png "Screenshot from subscription app")

### Data, Backups and Privacy

The database contains the following tables:

* boxes
* orders: 
* logs
* settings
* registry
* subscriptions (to be deprecated)

I made the conscious decision that no sensitive data is stored on the BoxesApp
server (with the exception of address for orders). BoxesApp does not process
any payments. All personal customer data is stored by Shopify and Recharge.
Nightly cron jobs are run and backup data files are emailed in json format to
the admin. A weekly cron job removes boxes, orders, and logs older than 2 weeks
(Shopify and Recharge both maintain all historic order and subscription data
and boxes and logs created in BoxesApp remain available in json formatted
backup files).

### Latest

With the release of Shopify's subscription api a number of third party apps
have been created to work with the api. In particular [Recharge
Payments](https://rechargepayments.com) has an extensive api and webhooks to
which I could integrate my BoxesApp. So, this past winter (2022) I have
extensively remodelled BoxesApp to include some missing features (especially
more error catching and logging) and integrate subscriptions directly with
Recharge and Shopify (as can be seen in the client side screenshot at the top
of this page). I managed to complete and release this in early September 2022,
it is now December and it seems that the app is working well with around 30
Recharge subscriptions and a current average of close to 200 boxes per week. I
also continue to run the old subscriptions as a separate app until such a time
as Streamside can migrate their old subscriptions to use the Recharge/Shopify
integration.

### Remuneration

My timekeeping over that last couple of years has been sparse and I can only
give a rough estimate of the time spent coding the BoxesApp to be well over 1000
hours (by using the command line utility `last` and making some fair assumptions).
My server costs me NZD$40 per month and I have recently invoiced Streamside for
12 months at NZD$75 per month. I'm a lousy capitalist. However, what if there were
10 store owners using the app, or 100? But I do not want to be the person
taking the app to that level. As indicated above I've sworn that I have had
enough of coding for this life and my "wants" are minimal.

### The Future

To be able to market the app to more store owners would take someone with a
skill set that I lack. I struggle with the anxiety of knowing it is being used
by one store owner and 200 customers - I reckon I'd fall apart if it were 10
stores and 2000 customers. For example, I honestly don't know how much load my
current setup could handle in order to figure out what level of resources would
be required as more app instances were added. As the app stands, installation
requires a far bit of manual setup which makes a "trial" install out of the
question. The documentation requires a lot of work. The code itself would not
stand up to industry standards; I have made efforts with
[eslint](https://eslint.org/) and [jsdoc](https://jsdoc.app/) from time to time
but mostly I've been pushing for results and lacked the time to follow through.

I maintain a list of features and improvements that didn't get into the current
version that I hope to be able to complete next winter. In the meantime I'm
working on [documentation](https://boxesapp.nz). I will publish this document
when the documentation is more complete.

Published December 20 2022.

