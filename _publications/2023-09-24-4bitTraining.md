---
title: "Training Transformers with 4-bit Integers."
collection: publications
permalink: /publication/2023-09-24-4bitTraining
excerpt: 'The paper proposes a way to train Transformer architect models in 4-bit quantization. It can be implemented on current generation of GPU and is faster than FP16 counterparts'
date: 2023-09-24
venue: 'NeurIPS'
paperurl: 'https://arxiv.org/pdf/2306.11987.pdf'
---

Quantizing the activation, weight, and gradient to 4-bit is promising to accelerate neural network training. However, existing 4-bit training methods require custom numerical formats which are not supported by contemporary hardware. In this work, we propose a training method for transformers with all matrix multiplications implemented with the INT4 arithmetic. Training with an ultra-low INT4 precision is challenging. To achieve this, we carefully analyze the specific structures of activation and gradients in transformers to propose dedicated quantizers for them. For forward propagation, we identify the challenge of outliers and propose a Hadamard quantizer to suppress the outliers. For backpropagation, we leverage the structural sparsity of gradients by proposing bit splitting and leverage score sampling techniques to quantize gradients accurately. Our algorithm achieves competitive accuracy on a wide range of tasks including natural language understanding, machine translation, and image classification. Unlike previous 4-bit training methods, our algorithm can be implemented on the current generation of GPUs. Our prototypical linear operator implementation is up to 2.2 times faster than the FP16 counterparts and speeds up the training by up to 35.1%. ([Code](https://github.com/xijiu9/Train_Transformers_with_INT4), [paper](https://arxiv.org/abs/2306.11987))