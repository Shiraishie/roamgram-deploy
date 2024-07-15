import React from "react";
import LoginPage from "./LoginPage";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthContext";

describe("<LoginPage />", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    cy.viewport(1500, 1080);
    cy.mount(
      <MantineProvider>
        <MemoryRouter>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <LoginPage />
            </QueryClientProvider>
          </AuthProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  });
  it("renders", () => {});

  it("Back to HomePage", () => {
    //checking back button
    cy.get(`[aria-label="actionIcon-back"]`)
      .click()
      .url()
      .should("include", Cypress.config().baseUrl);
  });

  it.only("Create Account button", () => {
    cy.get('[aria-label="create-button"]')
      .should("be.visible")
      .and("be.enabled")
      .click({ force: true })
      .url()
      .then((url) => {
        cy.log(url);
      });
  });

  it("Create Account redirect", () => {
    cy.get('[aria-label="create-button"]')
      .click()
      .url()
      .then((url) => {
        cy.log(url);
      })
      .should("include", "/signup");
  });

  it("logging in with unauthorized details", () => {
    cy.get('input[placeholder="Enter Username"]').type("test");
    cy.get('input[placeholder="Enter Password"]').type("test");
    cy.get("button").contains("Continue").click();
    cy.get(`.mantine-Popover-dropdown`).should("contain", "Error");
  });

  //need to edit
  it("loggin in with authorized details", () => {
    cy.get('input[placeholder="Enter Username"]').type("string");
    cy.get('input[placeholder="Enter Password"]').type("string");
    cy.get("button").contains("Continue").click();
  });
});