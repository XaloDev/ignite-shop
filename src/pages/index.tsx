import Image from 'next/image'
import { HomeContainer, Product } from '@ignite-shop/styles/pages/home'
import { useKeenSlider } from 'keen-slider/react'
import { GetStaticProps } from 'next'
import { stripe } from '@ignite-shop/lib/stripe'
import Stripe from 'stripe'

interface IProduct {
  id: string
  name: string
  imageUrl: string
  price: string
}

interface HomeProps {
  products: IProduct[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 2,
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
    <HomeContainer ref={sliderRef} className="keen-slider">
      {products.map((product) => {
        return (
          <Product className="keen-slider__slide" key={product.id}>
            <Image
              src={product.imageUrl}
              alt="camiseta"
              width={520}
              height={480}
              quality={100}
            />
            <footer>
              <strong>{product.name}</strong>
              <span>{product.price}</span>
            </footer>
          </Product>
        )
      })}
    </HomeContainer>
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
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(defaultPrice.unit_amount ? defaultPrice.unit_amount / 100 : 0),
    } as IProduct
  })

  return {
    props: {
      products,
    },
    revalidate: 60 * 10, // 10 minutes
  }
}
