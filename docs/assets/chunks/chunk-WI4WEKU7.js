// src/lessons/bee/content.json
var content_default = {
  slug: "bee",
  title: "Mission: The Bee",
  subtitle: "Help the hive by learning honey bees.",
  summary: "Meet the honey bee, learn its body parts, and carry pollen from flower to flower.",
  badge: "BEE",
  color: "#ffb020",
  activity: "pollinate",
  activityLabel: "Carry the pollen.",
  activityInstruction: "Move the bee to the flower, collect pollen, then bring it back to the hive.",
  difficulty: 1,
  topics: ["bee parts", "pollen", "honey", "hive"],
  classIds: ["BrickX"],
  storyVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  warmupVideoUrl: "https://www.youtube.com/embed/pn1qJET81a4",
  storyQuestions: [
    {
      prompt: "What do bees collect from flowers?",
      answers: ["Pollen and nectar", "Sand and stones", "Leaves and twigs"],
      correctIndex: 0,
      success: "Bees collect pollen and nectar from flowers."
    },
    {
      prompt: "Where do bees live?",
      answers: ["In a hive", "Under a rock", "In a pond"],
      correctIndex: 0,
      success: "Bees live together in a hive."
    },
    {
      prompt: "What do bees make from nectar?",
      answers: ["Honey", "Plastic", "Paper"],
      correctIndex: 0,
      success: "Bees turn nectar into honey."
    },
    {
      prompt: "How do bees help flowers?",
      answers: ["They carry pollen", "They eat the petals", "They hide the seeds"],
      correctIndex: 0,
      success: "Bees carry pollen that helps flowers grow."
    }
  ],
  quiz: [
    {
      prompt: "Which bee part helps it smell flowers?",
      answers: ["Antennae", "Stinger", "Wings"],
      correctIndex: 0,
      success: "Antennae help bees smell."
    },
    {
      prompt: "Which part of the bee carries pollen?",
      answers: ["The legs", "The wings", "The eyes"],
      correctIndex: 0,
      success: "Pollen baskets on the legs carry pollen."
    },
    {
      prompt: "How many wings does a bee have?",
      answers: ["Four wings", "Two wings", "Six wings"],
      correctIndex: 0,
      success: "A bee has four wings: two big and two small."
    },
    {
      prompt: "What is the middle part of the bee called?",
      answers: ["The thorax", "The head", "The wing"],
      correctIndex: 0,
      success: "The thorax is the middle body where wings attach."
    }
  ],
  parts: [
    {
      id: "head",
      label: "Head",
      fact: "The bee's head holds its eyes and antennae, which help it find flowers.",
      help: "The front part with the eyes."
    },
    {
      id: "antennae",
      label: "Antennae",
      fact: "Antennae help bees smell flowers and sense the world.",
      help: "The two feelers on the head."
    },
    {
      id: "wings",
      label: "Wings",
      fact: "A bee flaps its wings very fast to fly from flower to flower.",
      help: "The see-through wings on the back."
    },
    {
      id: "body",
      label: "Body",
      fact: "The bee's body is striped with yellow and black bands.",
      help: "The fuzzy middle and striped back part."
    },
    {
      id: "legs",
      label: "Legs",
      fact: "Pollen baskets on the legs carry pollen back to the hive.",
      help: "The six legs under the body."
    }
  ]
};

export {
  content_default
};
