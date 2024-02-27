---
title: How to make it Real-time?
toc: false

---

# Project Plan

This page details the project plan on how to handle visualizations in Real Time


### Why React and D3 Data visualization?
React re-renders only the components that changes the states using Recoinciliation algorithm. This makes the application faster and efficient. It also uses vdom to make the application faster. 

D3 Data visualization is a JavaScript library for producing dynamic, interactive data visualizations in web browsers. It makes use of the widely implemented SVG, HTML5, and CSS standards. It is used to visualize the data in the react application.


### Why Nodejs and Socket Programming?
Node.js is an open-source, cross-platform, back-end JavaScript runtime environment that runs on the V8 engine and executes JavaScript code outside a web browser. It is used to deploy the server endpoint. Socket Programming is used to communicate between the server and the client. It is used to send the data from the server to the client.



## Approach 1 - Data Ingestion directly to the endpoint
Nodejs + Socket Programming + React + D3 Data visualization

With the help of Nodejs server endpoint, we can communicate to the client using Socket Programming. The data can be sent from the server to the client using the socket programming. The data is then visualized in the react application using D3 Data visualization. This is the most efficient way to handle the real-time data visualization.

Advantages:
- Easy to implement
- Ideal for small data
- Bi-directional communication between the server and the client

Disadvantages:
- Little time Consuming as Data Filtering and Data Transformation happens on the client side
- Not efficient for larger data
- Data is not stored in the server. This is a limitation of the approach.
- No support for interactive queries as there is no database



Additional Points:
- For scalability of the requests, we can create a load balancer and deploy multiple server endpoints. This will help in handling the requests efficiently.
- Data sent in network is not compressed. We can compress, however it will add time overhead in compressing and decompressing the data unless the data is directly apache arrow data
- Data needs to be sent to endpoint. However we can use Apache Kafka to handle the data ingestion in the server.

<hr/>


## Approach 2 - Store the data in database and send the transformed data to the client
Nodejs + Socket Programming + React + D3 Data visualization + Apache Druid

Druid is a high performance, real-time analytics database that delivers sub-second queries on streaming and batch data at scale and under load. The data is stored in the database and the transformed data is sent from the server to the client using the socket programming. 

Advantages:
- Ideal for large data
- Data is stored in the server
- Bi-directional communication between the server and the client
- Data Processing and Data Transformation happens in the server directly
- Supports interactive queries. We could use redis to store the frequent queries and use it for interactive queries

Disadvantages:
- Time overhead in deserializing the data in Apache Druid
- Data sent in network is not compressed. 

Additional Points:
- For scalability of the requests, we can create a load balancer and deploy multiple server endpoints. This will help in handling the requests efficiently.
- Data sent in network is not compressed. We can compress, however it will add time overhead in compressing and decompressing the data unless the data is directly apache arrow data
- Data needs to be sent to endpoint. However we can use Apache Kafka to handle the data ingestion in the server.


<hr/>


## Approach 3 - Store the data in database and take advantage of Apache Arrow and Apache Flight
Nodejs + Socket Programming + Apache Flight SQL + Database + React + D3 Data visualization


### Why Apache Flight?
Apache Flight is a highly efficient, low-latency transport for large datasets. Flight is integrated with Arrow, a columnar in-memory analytics layer. It can transfer Apache Arrow data between server and client without serialization overhead. However the client should initiate the connection to the server. This is a limitation of the Apache Flight. This is where the socket programming comes into play. The server can send that "It have new data" to the client using the socket programming and client can initiate the connection to the server to get the new data. This is the reason why we are using socket programming in this project. The data is finally sent from the server to the client using Apache Flight.

We can integrate the Apache FLight SQL with databases such as PostgreSQL, MySQL, etc. There are Apache Flight Connectors that can query and send the apache arrow files directly to the client.


Advantages:
- No Time overhead in serializing and deserializing the data
- Ideal for large data
- Data is stored in the server
- Supports interactive queries. We could use redis to store the frequent queries and use it for interactive queries


Disadvantages:
- Very less community and online support for Apache Flight
- The client visualization needs the data in csv so parsing takes little time 

Additional Information:
- Designed for high compressibility and larger number of rows. [Ref](https://www.youtube.com/watch?v=OLsXlKb_XRQ) (10:42 Mins)
- Enables Parallel data transfers

<hr/>

## Approach 4 - Mosaic Framework 
Nodejs + Mosaic Framework + duckdb +  socket programming

Mosaic is an extensible framework for linking databases and interactive views.

Advantages:
- Super fast and efficient for less clients
- optimized for Multiple views/charts
- Faster interactive charts and  can handle billions of records
- No parsing needed as the duckdb can return and mosaic can use the apache arrow files directly
- Inbuilt data visualization library (vegaplot)

Disadvantages:
- Data ingestion to duckdb. Generally duckdb server runs on one machine. Bottle neck on the client requests
- very early stage and less support
- visualizations limited to vegaplot

Its convenient for less clients and huge data, faster interactive charts.

Example: [https://uwdata.github.io/mosaic/examples/flights-10m.html](https://uwdata.github.io/mosaic/examples/flights-10m.html)



Each Approach has its own advantages and disadvantages. The approach can be chosen based on the requirements and the data size.
