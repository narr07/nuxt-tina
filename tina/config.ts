import { defineConfig } from 'tinacms'

const branch = process.env.NUXT_TINA_BRANCH
  || process.env.TINA_BRANCH
  || process.env.HEAD
  || 'main'

export default defineConfig({
  branch,
  clientId: process.env.NUXT_TINA_CLIENT_ID || process.env.TINA_CLIENT_ID || '',
  token: process.env.NUXT_TINA_TOKEN || process.env.TINA_TOKEN || '',
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'page',
        label: 'Pages',
        path: 'content/pages',
        format: 'md',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
      },
    ],
  },
})
