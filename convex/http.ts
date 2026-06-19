import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { payfastWebhook, paystackWebhook } from "./paymentsNode";

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

export default http;
