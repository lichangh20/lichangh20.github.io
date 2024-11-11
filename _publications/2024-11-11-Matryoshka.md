---
title: "Matryoshka: Learning to Drive Black-Box LLMs with LLMs"
collection: publications
permalink: /publication/2024-11-11-Matryoshka
excerpt: 'The paper proposes a lightweight white-box LLM controller that guides large-scale black-box LLM generator by decomposing complex tasks. It can enhance capabilities of black-box LLMs in reasoning, planning and personalization tasks.'
date: 2024-11-11
venue: ''
paperurl: 'https://arxiv.org/abs/2410.20749'
---

Despite the impressive generative abilities of black-box large language models (LLMs), their inherent opacity hinders further advancements in capabilities such as reasoning, planning, and personalization. Existing works aim to enhance LLM capabilities via domain-specific adaptation or in-context learning, which require additional training on accessible model parameters, an infeasible option for black-box LLMs. To address this challenge, we introduce Matryoshika, a lightweight white-box LLM controller that guides a large-scale black-box LLM generator by decomposing complex tasks into a series of intermediate outputs. Specifically, we consider the black-box LLM as an environment, with Matryoshika serving as a policy to provide intermediate guidance through prompts for driving the black-box LLM. Matryoshika is trained to pivot the outputs of the black-box LLM aligning with preferences during iterative interaction, which enables controllable multi-turn generation and self-improvement in optimizing intermediate guidance. Empirical evaluations on three diverse tasks demonstrate that Matryoshika effectively enhances the capabilities of black-box LLMs in complex, long-horizon tasks, including reasoning, planning, and personalization. By leveraging this pioneering controller-generator framework to mitigate dependence on model parameters, Matryoshika provides a transparent and practical solution for improving black-box LLMs through controllable multi-turn generation using white-box LLMs. ([Code](https://github.com/lichangh20/Matryoshka), [paper](https://arxiv.org/abs/2410.20749))