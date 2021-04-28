import 'dotenv/config';

export default {
  bail: true,
  clearMocks: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  preset: 'ts-jest',
  testEnvironment: "node",
  collectCoverageFrom: [
		'<rootDir>/src/modules/**/useCases/**/*(?:UseCase|Controller).ts',
		'<rootDir>/src/modules/**/repositories/**/[^I]*Repository.ts'
	],
  coverageReporters: [
    "html",
    "text",
  ],
  testMatch: [
    "**/*.spec.ts"
  ],
};
