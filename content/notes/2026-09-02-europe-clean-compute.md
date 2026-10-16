---
title: "Europe’s clean compute ambition depends on *grid connection capacity*"
slug: "europe-clean-compute"
date: 2026-09-02
status: "published"
readingTime: "6 min read"
category: "Grids and digitalisation"
image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80&auto=format&fit=crop"
excerpt: "Data centres are projected to increase from 2% of EU electricity demand to nearly 8% by 2030, while connection timelines in several markets already extend from seven to thirteen years. If clean compute is the advantage Europe holds, the binding constraint is the speed of interconnection rather than the carbon intensity of the supply, which makes this a power systems problem before it is a policy one."
lede: "Elena Bou argues that Europe should stop attempting to replicate the American cloud industry and should instead build the layer in which it already has capability. I agree with that conclusion. The point I would add, from the engineering side of the problem, is that the asset she describes is not clean electricity itself but the capacity to connect new load to the network, and that is currently the scarcer of the two."
sourceTitle: "Europe Can’t Recreate Silicon Valley. Here’s What It Can Build Instead"
sourceAuthor: "Elena Bou, co-founder of InnoEnergy"
sourcePublication: "Forbes"
sourceDate: "26 August 2026"
sourceUrl: "https://www.forbes.com/sites/elenabou/2026/08/26/europe-cant-recreate-silicon-valley-heres-what-it-can-build-instead/"
tags:
  - "Grid capacity"
  - "Data centres"
  - "Flexibility"
  - "EU policy"
stats:
  - num: "2% to 8%"
    label: "Data centres as a share of EU electricity demand, today against 2030"
  - num: "7 to 13 yrs"
    label: "Connection timelines in markets where development is outpacing the network"
  - num: "213 g"
    label: "CO2 per kWh on the EU grid in 2024, against 384 g in the United States"
  - num: "~5%"
    label: "Europe’s share of global AI computing capacity, against roughly 75% in the US"
readingNext:
  - "IEA, Overcoming energy constraints is key to delivering on Europe’s data centre goals"
  - "European Parliament briefing on data centres in the EU energy system (EPRS 775859)"
  - "Ember, Global Electricity Review 2025, for the carbon intensity series behind the 213 g figure"
---

I read this article from the perspective of an engineer who has worked on the connection side of the problem. Before beginning the SENSE MSc at KTH, I spent two years performing load flow, short-circuit and transient stability studies at GE Vernova, and automating PSS®E and TSAT workflows at Siemens. In one form or another, most of that work answered a single question on behalf of a client: whether a proposed facility could connect to the network, and what would be violated if it did. When an article describes data centres as a significant new load on the European system, that is the question I return to.

## Key figures from the article

Four figures are worth considering together, since they describe a specific engineering problem rather than a general policy concern.

Carbon intensity is the figure most often quoted, since it is the most favourable to Europe. A hyperscaler selecting a site, however, is not optimising for grams of CO2 per kilowatt-hour in isolation. It is optimising for how much capacity can be secured, how firmly it is guaranteed, and how soon it becomes available. A network that is 45% cleaner but eight years slower to connect does not win that comparison, and the projects that Europe loses on this basis are not lost on environmental grounds.

> For a developer choosing between European sites, the binding constraint is not the carbon intensity of the electricity but the number of years required to obtain a firm connection.

## Assessment of the argument

The framing of sovereignty as leverage rather than self-sufficiency is the strongest element of the article, and it corresponds closely to the way transmission systems are actually planned. A network is not designed so that every element is redundant with every other element. It is designed so that the system survives the loss of any single credible element, and investment is directed towards the contingencies that bind. The estimate of 3.6 trillion euros for replacing foreign providers across the entire stack represents the cost of the fully redundant approach, whereas the Cloud and AI Development Act, which reserves approximately 1% of workloads for providers under European control, represents the selective one.

I also agree that value is more likely to accumulate in the layer surrounding the compute than in the compute itself, meaning power systems, grids, storage, cooling and industrial software. In my own N-1 screening work on the IEEE 39-bus network, the most heavily loaded element under contingency reached 157.5% of its rating, and the remedy was not additional generation but a question of where the flows were directed and which elements were able to absorb them. Adding several gigawatts of inflexible load to a European network that is already managing high renewable penetration is the same problem at larger scale and under a fixed schedule.

## Additional considerations from a system studies perspective

The article treats data centres primarily as demand to be accommodated. I would argue that they should instead be modelled as controllable resources within the dispatch, and several points follow from this, each of which is a system studies question before it is a policy question.

- **Connection speed should be treated as a design variable.** Flexible connection agreements, under which a site accepts curtailment during defined stressed periods in exchange for connecting several years earlier, convert a queueing problem into a contractual one. Trials of this kind are already running in Great Britain and the Netherlands.
- **AI load is not uniformly firm.** Inference is latency-sensitive, whereas large training runs are considerably less so. A training workload that can be shifted by several hours resembles a storage asset more closely than it resembles an industrial load, and this distinction should be represented in the load models used for planning studies.
- **Co-location does not remove the network requirement.** Siting compute adjacent to a wind farm appears to resolve the interconnection problem, but unless the facility is genuinely islanded it still requires firm backup capacity from the network during low-wind periods, and that backup is the costly component of the connection request.
- **Waste heat recovery is a second product rather than a footnote.** The EU energy roadmap refers to it and Nordic operators already implement it. In district heating markets it alters the economics of a site sufficiently to warrant explicit modelling.

None of these points contradicts the article. They relocate the substantive work from policy design to system studies.

## Relevance to my current work

I read this article while working on a battery dispatch optimiser, which returns zero revenue below a price spread to round-trip efficiency ratio of approximately 1.181. The article prompted me to consider running the same model with a flexible data centre load alongside the battery, since the formulation is largely unchanged apart from the constraint set: the resource is characterised by a value of curtailment rather than a value of discharge. Whether flexible compute is able to substitute for storage at the margin is a question I can address with the tools I already have, and I intend to write up the result as the next note.

The article concludes that the relevant question is no longer only which region produces the cleanest electricity, but which region has the capability to manage and optimise the system that delivers it. That is a reasonable description of the work I am training to do, and it is the reason the connection timeline figures stayed with me rather than the carbon intensity ones.
