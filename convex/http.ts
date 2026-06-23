import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { competitionTicketData, payfastWebhook, paystackWebhook } from "./paymentsNode";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/payfast-webhook",
  method: "POST",
  handler: payfastWebhook,
});

http.route({
  path: "/paystack-webhook",
  method: "POST",
  handler: paystackWebhook,
});

http.route({
  path: "/competition-ticket-data",
  method: "GET",
  handler: competitionTicketData,
});

export default http;
