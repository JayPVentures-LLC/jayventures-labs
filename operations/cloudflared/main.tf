provider "cloudflare" {
  api_token = "YOUR_CLOUDFLARE_API_TOKEN"
}

resource "cloudflare_access_policy" "allow_all_listed" {
  application_id = "YOUR_APP_ID"
  account_id     = "YOUR_ACCOUNT_ID"
  name           = "Allow All Listed"
  precedence     = 1
  decision       = "allow"
  include {
    email = [
      "jayhere@jaypventuresllc.com",
      "jaypventuresllc@outlook.com",
      "security@jaypventuresllc.com",
      "venture@jaypventuresllc.com",
      "support@jaypventuresllc.com",
      "jaypventures@icloud.com",
      "jasmynp11@gmail.com",
      "jasmyn.price@email.phoenix.edu"
    ]
  }
}

