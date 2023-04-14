import { stripe } from '@ignite-shop/lib/stripe'
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from '@ignite-shop/styles/pages/product'
import { IProduct } from '..'
import { GetStaticProps, GetStaticPropsContext } from 'next'
import Stripe from 'stripe'
import Image from 'next/image'
import axios from 'axios'
import { useState } from 'react'
import Head from 'next/head'

interface ProductPageProps {
  product: IProduct
}

export default function ProductPage({ product }: ProductPageProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] =
    useState(false)

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true)
      const response = await axios.post('/api/checkout', {
        priceId: product.priceId,
      })
      const { checkoutUrl } = response.data

      window.location.href = checkoutUrl
    } catch (err) {
      setIsCreatingCheckoutSession(false)
      alert('Falha ao redicionar ao checkout!')
    }
  }

  return (
    <>
      <Head>
        <title>Ignite Shop | {product.name}</title>
      </Head>
      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt="" />
        </ImageContainer>
        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button
            onClick={handleBuyProduct}
            disabled={isCreatingCheckoutSession}
          >
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (
  ctx: GetStaticPropsContext,
) => {
  const productId = ctx.params?.id as string
  if (!productId) {
    return {
      notFound: true,
    }
  }
  const response = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  })

  const defaultPrice = response.default_price as Stripe.Price

  const product = {
    id: response.id,
    name: response.name,
    imageUrl: response.images.length > 0 ? response.images[0] : '',
    description: response.description,
    price: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(defaultPrice.unit_amount ? defaultPrice.unit_amount / 100 : 0),
    priceId: defaultPrice.id,
  } as IProduct

  return {
    props: { product },
    revalidate: 60 * 10, // 10 minutes
  }
}
