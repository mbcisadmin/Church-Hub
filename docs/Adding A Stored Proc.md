# Adding a Stored Procedure

## Naming Convention:

- api*TheHub*... for shared between customers
- api*TheHub_Custom*... for an SP that is just for one customers

## Security Best Practices

- We will not, by and large, pass a @UserName parameter as Custom Widgets did.
  The security of a "dashboard" or "app" in the hub will be from user groups.
