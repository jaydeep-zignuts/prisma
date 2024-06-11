const request = require("supertest");
const app = require("./app");
const jwt = require("jsonwebtoken");
const { Delete } = require("./messages/message");
const authtoken =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibmFtZSI6ImpheWRlZXAiLCJ1c2VybmFtZSI6ImpkcGF0ZWwiLCJlbWFpbCI6ImpheWRlZXBAZ21haWwuY29tIiwiaWF0IjoxNzE3NzU3MDA4LCJleHAiOjE3MTc4NDM0MDh9.xKWIyPy4ZTa_mGvN6F5czXmQNkggOCr-DHGw9Woo64k";
describe("GET /users", () => {
  it("should return a users", async () => {
    const res = await request(app).get("/users").set({
      authorization: authtoken,
    });
    expect(res.statusCode).toBe(200);
  });
});
describe("GET /user/:uid", () => {
  it("should return a user", async () => {
    const uid = 1;

    const res = await request(app).get(`/user/${uid}`).set({
      authorization: authtoken,
    });
    console.log("---->>", res.body);
    expect(res.statusCode).toBe(200);
    // expect(res.body.data[0].name).toBe("Updated Name");
  });
});
describe("GET /users", () => {
  it("should return a users", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(401);
  });
});

describe("GET /user/:uid", () => {
  it("should return a user", async () => {
    const uid = 1;

    const res = await request(app).get(`/user/${uid}`);
    console.log(res.body);
    expect(res.statusCode).toBe(401);
  });
});
describe("PUT /user/:id", () => {
  it("should return a updated user", async () => {
    const id = 1;
    const updateData = {
      name: "Updated Name",
      email: "up@email.com",
    };
    const res = await request(app)
      .put(`/user/${id}`)
      .set("Authorization", `${authtoken}`)
      .send(updateData);
    // .send(updateData);
    console.log("jdjdjdjdjjd", res.body);
    expect(res.body.data.name).toBe("Updated Name");
    expect(res.statusCode).toBe(200);
  });
});

describe("DELETE /user/:id", () => {
  it("should delete user", async () => {
    const decoded = jwt.verify(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibmFtZSI6ImpheSIsInVzZXJuYW1lIjoiamF5IiwiZW1haWwiOiJqYXlAZ21haWwuY29tIiwiaWF0IjoxNzE3NzQyOTQzLCJleHAiOjE3MTc4MjkzNDN9.22IQBwUGmdgxZa7P9gojCaGX2zCyZCzwK96PLPDSYTo",
      process.env.JWT_SECRET
    );
    const id = decoded.id;
    const res = await request(app).delete(`/user/${id}`).set({
      authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibmFtZSI6ImpheSIsInVzZXJuYW1lIjoiamF5IiwiZW1haWwiOiJqYXlAZ21haWwuY29tIiwiaWF0IjoxNzE3NzQyOTQzLCJleHAiOjE3MTc4MjkzNDN9.22IQBwUGmdgxZa7P9gojCaGX2zCyZCzwK96PLPDSYTo",
    });
    console.log(res);
    // await expect(res.statusCode).toBe(200);
  });
});
