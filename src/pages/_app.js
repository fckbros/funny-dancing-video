import React from 'react'
import NextApp from 'next/app'
import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'

import theme from '../theme'

class App extends NextApp {
  render () {
    const { Component, pageProps } = this.props
    return (
      <ThemeProvider theme={theme}>
        <ColorModeProvider value='dark'>
          <CSSReset />
          <Component {...pageProps} />
        </ColorModeProvider>
      </ThemeProvider>
    )
  }
}

export default App
