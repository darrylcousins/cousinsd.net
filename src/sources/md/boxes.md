# BoxesApp

## Description

<div class="flex">
<div class="w-30 contain dark" id="boxes-logo">
</div>
<div class="w-70">
<a href="https://boxesapp.nz" title="boxesapp.nz" target="_blank">BoxesApp</a>
provides administration and client interfaces for selling items
grouped together in a box. As detailed below it was first and foremost
developed to sell and deliver boxes of organic vegetables, but there is no
reason why it couldn't be used to sell any type of widget in a box.
</div>
</div>

<div class="horizontal-rule"></div>

<div class="fl w-100 w-60-m w-70-l">

[BoxesApp](https://boxesapp.nz") is not a standalone online shopping service, it integrates with a
<a href="https://www.shopify.com" title="shopify.com" target="_blank">Shopify</a>
store and both the container box and the
included items are actual store products. The screenshot of the client
interface is from 
<a href="https://www.streamsideorganics.co.nz" title="streamsideorganics.co.nz" target="_blank">Streamside Organics</a>
who grow and market organic vegetables. The subscription option itself is an
integration with an established subscription service by
<a href="https://rechargepayments.com/ecommerce/shopify-subscriptions/" title="rechargepayments.com" target="_blank">Recharge Payments</a>.

Each week the boxes can be updated by the store owner with products according to season
and harvest. At <a href="https://www.streamsideorganics.co.nz"
title="streamsideorganics.co.nz" target="_blank">Streamside Organics</a> they
offer small, medium, and large boxes and are currently delivering close to 200
boxes per week. The customer is able to select items from a list to **add**
into the box, from the same list they may **swap** out items for another
available option. They may also change the quantity of any item in the box.

A **custom** box is also offered which has no included items and the customer
can *build* their box from the list of available products.

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
their vegatable boxes.  They had around 30-40 box customers, some
on a [Community Supported
Agriculture](https://www.nal.usda.gov/farms-and-agricultural-production-systems/community-supported-agriculture)
type scheme, and others paying weekly. For that first lockdown the rapid uptick
in customers meant that the site struggled to cope. Furthermore, at the time,
BuckyBox was indicating that it would cease to operate at the end of 2020 (that
hasn't come about as it happens). Looking for another way to market their boxes
online to a locked down population, [Streamside
Organics](https://www.streamsideorganics.co.nz) opened a
[Shopify](https://www.shopify.com) store.

### Getting Started

However, a [Shopify](https://www.shopify.com) store cannot offer the sort
functionality that [BuckyBox](https://www.buckybox.com/) offers. To be
effective the store needed to allow:

* exclusions and substitutes
* extra items
* selected delivery days
* pick up options
* easy weekly editing of products in boxes
* compilation of picking and packing lists
* data format for printing labels

Most, but not all, of these requirements could be met using a stock standard
store but required a lot of admin time. I think that
[Shopify](https://www.shopify.com) is a fine piece of web commerce software; furthermore,
apps can be built on top of the extensive api that comes with the platform. Apps can
add features and deliver unique customer experiences.

At the time I was working on the farm with the harvesting crew. With a coding
background and a desire to help, I put my hand up.

### Building A Shopify App

Broadly speaking the technical requirements of a Shopify App encompass the
entire depth of a computer system application, and straddles two separate web
development domains: the front end and the back end. In the case of
[BoxesApp](https://boxesapp.nz") the front end has two parts, that for the
customer can be seen in the screenshot above, and another is needed for
administration of the boxes. For the back end a database and a webserver are
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
by Shopify and most Shopify app development articles focus on React, so that
was used in my first explorations. But I don't actually like React (apologies
to all aficionados) so when I came across [Crank](https://crank.js.org/) it was
with great relief and a breath of fresh air. Discarding React for Crank has the
added advantage of greatly diminished asset file size. Because Crank was only
[introduced](https://crank.js.org/blog/) in April 2020 it was brand new at the
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
I've been a customer since 2004 (excepting 2018-2020 after solemny swearing
that I'd never code again).

### The Work

I began the work in my own time, evenings and weekends. As pressure built to
get it up and working I was given some paid time to work on the application.
Then I took several weeks unpaid leave to finally get an initial version
working. I did not keep good records of the time spent but it was certainly
running into hundreds of hours. Finally though I did have it running and in
lockdowns the farm was sending out close to 400 boxes a week.

As 2020 came to a close, BuckyBox was expected to shut down and it was apparent
that I needed to duplicate the **subscription** functionality of BuckyBox.
Shopify itself did not support subscriptions at the time, though did introduce
a subscription api in early 2021. So in September/October I was again pouring
my spare time into adding subscription functionality to the BoxesApp. It was
apparent that Streamside were not prepared to pay for my time, but I had made a
commitment. They proposed to me that I should charge them a monthly fee for the
app, to cover my server costs, maintainence, upgrades, and feature requests. I
really only had two choices, 1.  accept the proposal or, 2. withdraw my
support. Because of my personal sense of obligation the second option was out
of the question.

### Subscription App

Below are some screenshots of how I managed to duplicate the BuckyBox
functionality which does require an amount of adminstration effort from
Streamside:

1. Take a payment for a set number of weeks and manually create and insert a
   subscription for the customer.
2. Allow upload of weekly bank statements and code for reconcilation of
   payments against subscribers with an open subscription to generate the box orders.

### Latest

With the release of Shopify's subscription api a number of third party apps
have been created to work with the api. In particular [Recharge
Payments](https://rechargepayments.com) has an extensive api and webhooks to
which I could integrate my BoxesApp. So, this past winter (2022) I have
extensively remodelled BoxesApp to include some missing features and integrate
subscriptions directly with Recharge and Shopify (as can be seen in the client
side screenshot at the top of this page). I managed to complete and release this
in early September 2022, it is now December and it seems that the app is
working well with around 30 Recharge subscriptions and a current average of
close to 200 boxes per week. I also continue to run the old subscriptions as a
separate app until such a time as Streamside can migrate their old
subscriptions to use the Recharge/Shopify integration.

### Renumeration

My timekeeping over that last couple of years has been sparse and I can only
give a rough estimate of the time spent coding the BoxesApp of well over 1000
hours.  My server costs me NZD$40 per month and I have recently invoiced
Streamside for 12 months at NZD$75 per month.

### The Future

I maintain a list of features and improvements that didn't get into the current
version that I hope to be able to leave until next winter when I will need to
make time for them. In the meantime I'm working on
[documentation](https://boxesapp.nz). I will publish this document when the
documentation is more complete.

Published: 16 Dec 2022 | Last edit: 16 Dec 2022

