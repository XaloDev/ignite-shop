import { globalStyles } from '@ignite-shop/styles/global'
import type { AppProps } from 'next/app'
import logoImg from '@ignite-shop/assets/logo.svg'
import { Container, Header } from '@ignite-shop/styles/pages/app'
import Image from 'next/image'

import 'keen-slider/keen-slider.min.css'
import Link from 'next/link'
globalStyles()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Container>
      <Header>
        <Link href={'/'}>
          <Image src={logoImg} alt="" priority quality={100} />
        </Link>
      </Header>

      <Component {...pageProps} />
    </Container>
  )
}
