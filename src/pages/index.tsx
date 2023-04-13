import Image from 'next/image'
import { HomeContainer, Product } from '@ignite-shop/styles/pages/home'
import { useKeenSlider } from 'keen-slider/react'
import { GetServerSideProps } from 'next'
import { stripe } from '@ignite-shop/lib/stripe'
import Stripe from 'stripe'

interface IProduct {
  id: string
  name: string
  imageUrl: string
  price: number
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
              <span>R$ {product.price.toFixed(2)}</span>
            </footer>
          </Product>
        )
      })}
    </HomeContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
  })

  const products = response.data.map((product) => {
    const defaultPrice = product.default_price as Stripe.Price
    return {
      id: product.id,
      title: product.name,
      imageUrl: product.images.length > 0 ? product.images[0] : '',
      price: defaultPrice.unit_amount ? defaultPrice.unit_amount / 100 : 0,
    }
  })

  console.log(products)

  return {
    props: {
      products,
    },
  }
}
