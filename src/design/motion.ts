export const motion = {
  duration: {
    instant: 100,
    quick: 180,
    standard: 280,
    gentle: 400,
    slow: 600,
  },
  spring: {
    bouncy: {
      damping: 10,
      stiffness: 120,
      mass: 0.8,
    },
    responsive: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    gentle: {
      damping: 20,
      stiffness: 90,
      mass: 1,
    },
    stiff: {
      damping: 25,
      stiffness: 220,
      mass: 0.9,
    },
  },
};

export type Motion = typeof motion;
