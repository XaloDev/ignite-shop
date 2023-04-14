import Image from 'next/image'
import { HomeContainer, Product } from '@ignite-shop/styles/pages/home'
import { useKeenSlider } from 'keen-slider/react'
import { GetStaticProps } from 'next'
import { stripe } from '@ignite-shop/lib/stripe'
import Stripe from 'stripe'
import Head from 'next/head'

export interface IProduct {
  id: string
  name: string
  imageUrl: string
  price: string
  description: string
  priceId: string
}

interface HomeProps {
  products: IProduct[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 2.1,
      spacing: 48,
    },
    breakpoints: {
      '(max-width: 1180px)': {
        slides: {
          perView: 1.1,
          spacing: 16,
        },
      },
    },
  })

  return (
    <>
      <Head>
        <title>Ignite Shop | Home</title>
      </Head>
      <HomeContainer ref={sliderRef} className="keen-slider">
        {products.map((product) => {
          return (
            <Product
              className="keen-slider__slide"
              key={product.id}
              href={`/product/${product.id}`}
              prefetch={false}
            >
              <Image
                src={product.imageUrl}
                alt="camiseta"
                width={520}
                height={480}
                style={{ objectFit: 'cover' }}
              />
              <footer>
                <strong>{product.name}</strong>
                <span>{product.price}</span>
              </footer>
            </Product>
          )
        })}
      </HomeContainer>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
  })

  const products = response.data.map((product) => {
    const defaultPrice = product.default_price as Stripe.Price
    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images.length > 0 ? product.images[0] : '',
      description: product.description,
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(defaultPrice.unit_amount ? defaultPrice.unit_amount / 100 : 0),
      priceId: defaultPrice.id,
    } as IProduct
  })

  return {
    props: {
      products,
    },
    revalidate: 60 * 10, // 10 minutes
  }
}
