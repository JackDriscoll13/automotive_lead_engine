# Overview

**Summary:**

This is the codebase for [qfresheners.com/leads](https://www.qfresheners.com/leads).

The primary purpose of this application is to generate leads for a company that sells ancillary items to automotive businesses. The app allows sales people to quickly explore locations and generate long sheets of leads that can be used to contact businesses or fed into CRM tools.

The intended user base is extremley small (2-4 people).

The application is publicly deployed for ease of use and because there is limited potnetial for abuse.

**Tech Stack:** 

The frontend is React JS, Tailwind CSS, and Chart JS (react-chart-js2) for the Analytics Chart. 

The backend is built in python with FastApi. 

**Core App:**

This applicaiton uses 3 endpoints from the new Google Places API to collect information on businesses through different means. 

The Location Search Feature uses the [text search](https://developers.google.com/maps/documentation/places/web-service/text-search) endpoint to find businesses given a text query and a location. This feature is built in a minimal way and is basically a glorified wrapper on the text search endpoint. 

The Zip Code Search feature combines google's [geocoding api](https://developers.google.com/maps/documentation/geocoding/overview) and the [nearby search](https://developers.google.com/maps/documentation/places/web-service/nearby-search) to search businesses in a list of zip codes. This enables users to search up to 50 zip codes at a time. It also enables high resolution using a radius users can customize. This feature uses a python generator to stream data in real time to the frontend via FastApi's streaming response model. 

I reccomend playing with the application to get a feel for how it works before diving into the code. The analytics page is helpful for understanding how many api calls you are making with each search. 

Or if you're a psycopath you can read the docs I wrote for my future self. They can be found in [docs/docs.md](docs/docs.md)
