import 'dotenv/config';

export default {
  bail: true,
  clearMocks: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  preset: 'ts-jest',
  testEnvironment: "node",
  collectCoverageFrom: [
		'<rootDir>/src/modules/**/useCases/**/*UseCase.ts'
	],
  coverageReporters: [
    "html",
    "text",
  ],
  testMatch: [
    "**/*.spec.ts"
  ],
};
