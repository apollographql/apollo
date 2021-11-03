---
title: Apollo FAQ on Licensing under Elastic License v2 (ELv2)
sidebar_title: Elastic License v2 FAQ
---

Starting with the 2.0.0-alpha release, our source code for Apollo Federation (including the gateway and federation libraries), the Rover composition add-on, and Workbench will be licensed under the [Elastic License v2](https://www.elastic.co/licensing/elastic-license) (ELv2). All previous versions of the gateway and federation libraries (0.x) remain MIT-licensed.

We chose ELv2 because of its permissiveness and simplicity. We’re following the well-paved path of other great infrastructure projects like Elasticsearch and MongoDB that have implemented similar source code licenses to preserve their communities. Our community and customers still have no-charge and open access to use, modify, redistribute, and collaborate on the code. ELv2 also protects our continued investment in developing freely available libraries and developer tools by restricting cloud service providers from offering Apollo Federation as a service.

## What is allowed with the Elastic License v2?

The [Elastic License v2](https://www.elastic.co/licensing/elastic-license) applies to our distribution and the source code of the Apollo Federation gateway and libraries. Our goal with ELv2 is to be as permissive as possible, while protecting our product and brand from abuse. The license allows the free right to use, modify, create derivative works, and redistribute, with three simple limitations:

1. You may not provide the products to others as a managed service.
1. You may not circumvent the license key functionality or remove/obscure features protected by license keys.
1. You may not remove or obscure any licensing, copyright, or other notices.

Please reach out to us at [license@apollographql.com](mailto:license@apollographql.com) if you’re unsure whether your use case falls outside these limitations.

## I’m using the MIT-licensed 0.x version of the Apollo Federation gateway and libraries in my project. How does ELv2 affect me?

We will continue to actively maintain the MIT-licensed 0.x Apollo Federation packages until the end of 2022, by merging compatibility updates, bug fixes, security patches, and select feature enhancements. All 0.x packages will be published to npm, just as before. We want you to have a smooth and gradual migration to Apollo Federation 2 at your own pace.

## What license applies to me if I’m using the new Apollo Federation 2 packages?

ELv2 applies to the source code and npm packages for the Apollo Federation 2 libraries and gateway, starting with the v2.0.0-alpha.\* release.

## I’m a maintainer of a subgraph framework, library, or platform that supports Apollo Federation. How does ELv2 affect me?

It doesn’t! The `@apollo/subgraph` library will remain MIT-licensed for all versions of Apollo Federation, so you can freely embed it in any subgraph library, framework, or platform with full OSS license compatibility. For more information on how to make your subgraph library work with Apollo Federation, check out our [subgraph maintainers guide](https://github.com/apollographql/apollo-federation-subgraph-compatibility/blob/main/CONTRIBUTORS.md).

## I use the Apollo Federation gateway and libraries internally at my company. How does ELv2 affect me?

Your internal use won’t be impacted at all. ELv2 allows you to use the software internally, and you may continue to use the default distribution of the Apollo Federation gateway and libraries for free. Restrictions only apply if you plan to offer a routing service to third parties or remove any licensing key code. To access our [Enterprise plan](https://www.apollographql.com/enterprise), you will need a subscription.

## I’m building a federated graph for my business. How does ELv2 affect me?

You may freely use the Apollo Federation gateway and libraries inside your SaaS or self-managed application, and redistribute it with your application, provided you follow the three limitations outlined above.

## I’m customizing the Apollo Federation libraries or gateway inside my application. How does ELv2 affect me?

You can make any modifications to the Apollo Federation packages (such as the gateway or query planner), subject to only the three limitations summarized above. If you want to share those modifications with us, please see our [contributing guide](https://www.apollographql.com/docs/community/contributing/). If you have any questions, please reach out to us at [license@apollographql.com](mailto:license@apollographql.com).

### Can I extend or modify the gateway by creating plugins?

Yes, absolutely.

### Can I distribute a modified gateway?

Yes, absolutely. You just need to adhere to the three restrictions summarized above.

### Am I required to release the source code to my gateway extensions?

No. Unlike GPL-style licenses, ELv2 does not require that you make your source code available. You just need to follow the three restrictions.

## I contribute to Apollo Federation. How does ELv2 affect me?

There are no changes for contributors under ELv2. Thank you for your contributions to Apollo! If you’re interested in contributing to any of our projects, please read our [contributing guide](https://www.apollographql.com/docs/community/contributing/).

## Will Apollo continue to provide open-source software?

Absolutely! Open-source software is at the heart of what we do. We’re grateful for the Apollo community and all of your contributions. We are committed to developing our MIT-licensed projects you know and love, including Rover, Apollo Client, and Apollo Server, as well as pioneering new open-source graph technology. Relicensing Apollo Federation 2 to ELv2 helps us honor that commitment. It prevents bad actors from harming our community and protects our ability to build open-source software for years to come.

## What does "You may not remove or obscure any licensing, copyright, or other notices" mean?

This limitation is intended to protect our software and brand by preventing folks from removing notice of the license, copyrights, or trademarks (such as the terms Apollo Federation and in-product logos). These notices communicate the license terms when redistributing the products. Open-source licenses such as MIT and Apache also require retention of copyright and permission notices in software copies, so this concept is not unique to ELv2.

## Can you share examples that explain "providing the software to third parties as a hosted or managed service"?

### Using Apollo Federation to serve all traffic to my SaaS product.

Yes, permitted.

### Running a gateway that includes proprietary code, such as a plugin.

Yes, permitted. There is no requirement to distribute or open-source your code.

### Distributing a modified gateway that includes proprietary code as a product, like a console.

Yes, permitted. Unlike GPL or SSPL, ELv2 is not copyleft. Your code remains closed.

### Providing a public graph API in my SaaS product to third parties.

Yes, permitted because you do not provide the software to third parties as a hosted or managed service, where the service provides users with access to any substantial set of the features or functionality of the software.

### Providing Apollo Federation as a service, where customers have direct access to substantial portions of the Apollo Federation gateway or libraries.

This use is not permitted under the new license. If you have questions about your specific scenario, please reach out to us at [license@apollographql.com](mailto:license@apollographql.com).
