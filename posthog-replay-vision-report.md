# Replay Vision report

## Recording coverage

Session Replay is enabled in PostHog and browser recordings can now flow from the application. The existing browser initialization keeps recording enabled; however, `/admin` routes intentionally do not initialize PostHog, so they will not produce recordings.

## Active Replay Vision scanners

| Scanner | What it watches | Query scope | Estimated monthly credits |
| --- | --- | --- | ---: |
| **Order placement failures** | Catalog-loading failures, unusable service selection, failed or provider-rejected orders, a stuck processing state, and missing invoice confirmation. | Recordings that include `/member/order`; samples 50% of eligible recordings. | **40** (about 8 observations) |
| **Social media order frustration** | Visible friction while selecting or filtering services, entering a target and quantity, placing an order, using balance, or preparing a cryptocurrency deposit. | Recordings gated only by the `$rageclick` event. | **0 currently** (no matching recordings in the latest four-day estimate) |
| **SMM order session summaries** | Summaries of customer activity across the service catalog, orders, deposits, payment invoices, and order history. | All eligible recordings; samples 10%. | **40** (about 8 observations) |

The current estimated combined spend is **80 credits per month**, plus any future volume from rageclick-matched sessions. The project had 2,500 Replay Vision credits remaining when these scanners were created.

## Deferred or excluded coverage

- **Admin routes are excluded from recording** by the existing client initialization, so Replay Vision cannot observe those routes unless PostHog is deliberately enabled there.
- The frustration scanner has no estimated current spend because no recent recordings matched its `$rageclick` gate. It is enabled and will begin processing when matching recordings arrive.
- No scanners were skipped; all three requested monitors are enabled.

## Where to look

Open the [Replay Vision page in PostHog](https://us.posthog.com/project/493791/replay-vision) to review scanner results. The first observations will appear as new eligible session recordings complete. You can also open the [Order placement failures scanner](https://us.posthog.com/project/493791/replay-vision/01a19b44-530a-7d93-b978-ac2f4bc3dca0) directly.
