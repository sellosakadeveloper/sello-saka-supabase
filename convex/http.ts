import { httpRouter } from "convex/server";
import { payfastWebhook, paystackWebhook } from "./paymentsNode";

const http = httpRouter();

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
