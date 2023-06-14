import React from 'react'
import Head from 'next/head'
import { ClientCredentials } from 'simple-oauth2'
import { GraphQLClient } from 'graphql-request'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { MetricsQuery } from '../graphql'
import ReportTable from '../components/ReportTable'

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
  const [columns, setColumns] = React.useState([])
  const [rows, setRows] = React.useState([])
  const [end, setEnd] = React.useState()
  const [start, setStart] = React.useState()

  const fetchData = React.useCallback(
    async (query, variables) => {
      try {
        client.setHeader('Authorization', 'Bearer ' + accessToken)
        const data = await client.request(query, variables)
        setMetrics(data)
        console.log('Data: ', data)
      } catch (error) {
        console.log(error)
      }
    },
    [accessToken]
  )

  const pageBack = () => {
    const variables = {
      input: {
        timeRange: {
          relative: 'PREVIOUS_MONTH'
        },
        metrics: [
          {
            uniqueName: 'revenue'
          }
        ],
        dimensions: [
          {
            columnName: 'PRODUCT_NAME',
            displayName: 'Product name'
          },
          {
            columnName: 'PRODUCT_CATEGORY',
            displayName: 'Product category'
          }
        ],
        last: 10,
        before: start
      }
    }
    fetchData(MetricsQuery, variables)
  }

  const pageForward = () => {
    const variables = {
      input: {
        timeRange: {
          relative: 'PREVIOUS_MONTH'
        },
        metrics: [
          {
            uniqueName: 'revenue'
          }
        ],
        dimensions: [
          {
            columnName: 'PRODUCT_NAME',
            displayName: 'Product name'
          },
          {
            columnName: 'PRODUCT_CATEGORY',
            displayName: 'Product category'
          }
        ],
        first: 10,
        after: end
      }
    }

    fetchData(MetricsQuery, variables)
  }

  React.useEffect(() => {
    if (accessToken) {
      window.localStorage.setItem('accessToken', accessToken)
    }
  }, [accessToken])

  React.useEffect(() => {
    const variables = {
      input: {
        timeRange: {
          relative: 'PREVIOUS_MONTH'
        },
        metrics: [
          {
            uniqueName: 'revenue'
          }
        ],
        dimensions: [
          {
            columnName: 'PRODUCT_NAME',
            displayName: 'Product name'
          },
          {
            columnName: 'PRODUCT_CATEGORY',
            displayName: 'Product category'
          }
        ],
        first: 10
      }
    }

    if (accessToken) {
      fetchData(MetricsQuery, variables)
    }
  }, [accessToken, fetchData])

  React.useEffect(() => {
    if (metrics) {
      setEnd(metrics.metricReport.pageInfo.endCursor)
      setStart(metrics.metricReport.pageInfo.startCursor)

      setColumns(
        metrics.metricReport.headers.map((header) => ({
          Header: header,
          accessor: header.toLowerCase()
        }))
      )
      let tempRows = []
      metrics.metricReport.rows.forEach((row) => {
        let innerObj = {}
        row.forEach((innerRow, i) => {
          let tempVal = innerRow
          if (!isNaN(parseFloat(tempVal))) {
            tempVal = `$${parseFloat(innerRow).toFixed(2)}`
          }
          innerObj[metrics.metricReport.headers[i].toLowerCase()] = tempVal
        })
        tempRows.push(innerObj)
      })
      setRows(tempRows)
    }
  }, [metrics])

  return (
    <>
      <Head>
        <title>Report Dashboard</title>
      </Head>
      <h1>Report Dashboard</h1>
      <div>
        {columns && rows ? (
          <>
            <ReportTable columns={columns} rows={rows} />
          </>
        ) : (
          Loading
        )}
        {metrics && (
          <ButtonGroup spacing="6">
            {metrics.metricReport.pageInfo.hasPreviousPage && (
              <Button colorScheme="teal" onClick={pageBack}>
                Previous page
              </Button>
            )}
            {metrics.metricReport.pageInfo.hasNextPage && (
              <Button colorScheme="teal" onClick={pageForward}>
                Next page
              </Button>
            )}
          </ButtonGroup>
        )}
      </div>
    </>
  )
}
