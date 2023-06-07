import React from 'react'
import { ClientCredentials } from 'simple-oauth2'
import { GraphQLClient } from 'graphql-request'

import { MetricsQuery } from '../graphql'

export async function getServerSideProps() {
  /**
   * Set the config for the OAuth2 client
   */
  const config = {
    client: {
      id: process.env.CLIENT_ID_SAMPLE_APP,
      secret: process.env.CLIENT_SECRET_SAMPLE_APP
    },
    auth: {
      tokenHost: process.env.TOKEN_HOST,
      tokenPath: process.env.TOKEN_PATH
    }
  }

  /**
   * Create the OAuth2 client
   */
  const oauth2Client = new ClientCredentials(config)

  /**
   * Get a token using the client credentials
   */
  const accessToken = await oauth2Client.getToken()

  return {
    props: {
      accessToken: accessToken.token.access_token
    }
  }
}

const client = new GraphQLClient(
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT_US_EAST_2
)

export default function App({ accessToken }) {
  const [metrics, setMetrics] = React.useState()

  React.useEffect(() => {
    if (accessToken) {
      window.localStorage.setItem('accessToken', accessToken)
    }
  }, [accessToken])

  React.useEffect(() => {
    async function fetchData() {
      try {
        client.setHeader('authorization', 'Bearer ' + accessToken)
        const { metrics } = await client.request(MetricsQuery)

        setMetrics(metrics)
      } catch (error) {}
    }

    if (accessToken) {
      fetchData()
    }
  }, [accessToken])

  return <div></div>
}
