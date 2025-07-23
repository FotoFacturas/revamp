import * as React from 'react';
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import IconMI from 'react-native-vector-icons/dist/MaterialIcons';
// angle-double-down
// AntDesign downcircleo
import Purchases from 'react-native-purchases';
import Video from 'react-native-video';
import { ScrollView } from 'react-native-gesture-handler';

// MaterialIcons expand-more expand-less
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

function truncateWholePrices(price) {
  // Check if price is null, undefined, or an empty string and return early
  if (price == null || price === '') {
    return price;
  }
  // Check if the last two characters are "00"
  price = `${price}`;

  price = price.replace(',', '.');

  if (price.endsWith('.00')) {
    // Remove the last three characters (.00)
    return price.slice(0, -3);
  }
  // If not "00", return the original price
  return price;
}

function SellCopy() {
  return (
    <View
      style={{
        marginTop: 14,
        marginBottom: 12,
        width: '90%',
        alignSelf: 'center',
      }}>
      <Text
        style={{
          fontSize: 20,
          textAlign: 'center',
          marginBottom: 16,
          lineHeight: 28,
          fontFamily: 'Graphik-Regular',
          color: 'rgba(0, 0, 0, 0.65)',
        }}>
        Ve como funciona Fotofacturas. Ahorramos tu tiempo e impuestos.
      </Text>
    </View>
  );
}

function VideoSection() {
  const videoRef = React.useRef(null);
  const [isPaused, setIsPaused] = React.useState(true);
  const videoAd = require('./../assets/premium_ad.mp4');

  return (
    <View
      style={{
        marginTop: 24,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
      <TouchableOpacity
        onPress={() => {
          // if android
          console.log('open video');
          if (Platform.OS === 'android') {
            Linking.openURL('https://www.youtube.com/watch?v=kqKMmLB1h7g');
          } else {
            // open youtube video link
            if (!videoRef.current) {
              console.log('no video ref');
              video_url = 'https://www.youtube.com/watch?v=kqKMmLB1h7g';
              Linking.openURL(video_url);
              return;
            }
            console.log('presenting video');
            videoRef.current.presentFullscreenPlayer();
            setIsPaused(false);
          }
        }}
        style={{
          width: (screenWidth / 3) * 1.8,
          height: (screenWidth / 3) * 1.4,
          borderRadius: 12,
        }}>
        <Image
          style={{
            borderColor: 'rgba(96, 35, 209, 1)',
            borderWidth: 2,
            borderRadius: 8,
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
          }}
          source={require('./../assets/thumbnail_4.png')}
        />
        <Video
          style={{}}
          ref={videoRef}
          source={videoAd}
          paused={isPaused}
          onFullscreenPlayerDidDismiss={() => {
            setIsPaused(true);
          }}
        />
      </TouchableOpacity>
    </View>
  );
}

function QA(props) {
  const [closed, setClosed] = React.useState(true);

  React.useEffect(() => {
    if (props.closed === false) {
      setClosed(false);
    }
  }, [props.closed]);

  return (
    <TouchableOpacity
      style={{
        width: '90%',
        alignSelf: 'center',
        marginTop: 8,
        paddingTop: 8,
        paddingBottom: 4,
      }}
      onPress={() => setClosed(state => !state)}>
      <View style={{flexDirection: 'row', position: 'relative'}}>
        <View style={{maxWidth: '90%'}}>
          <Text
            style={{
              fontFamily: 'Graphik-Regular',
              fontWeight: '500',
              color: 'rgba(0, 0, 0, 0.65)',
              fontSize: 16,
              lineHeight: 26,
              marginBottom: 6,
            }}>
            {props.question}
          </Text>
        </View>
        <View style={{position: 'absolute', right: 0, top: 0}}>
          {closed ? (
            <IconMI name="expand-more" color="rgba(70,35,170,1)" size={22} />
          ) : (
            <IconMI name="expand-less" color="rgba(70,35,170,1)" size={22} />
          )}
        </View>
      </View>
      {closed ? (
        <></>
      ) : (
        <Text
          style={{
            fontFamily: 'Graphik-Regular',
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
            lineHeight: 20,
          }}>
          {props.answer}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function Review(props) {
  return (
    <View
      style={{
        marginTop: 42,
        alignItems: 'center',
      }}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'flex-start',
          flexDirection: 'row',
        }}>
        <Icon name="star" solid color="rgba(70,35,170,1)" size={16} />
        <Icon name="star" solid color="rgba(70,35,170,1)" size={16} />
        <Icon name="star" solid color="rgba(70,35,170,1)" size={16} />
        <Icon name="star" solid color="rgba(70,35,170,1)" size={16} />
        <Icon name="star" solid color="rgba(70,35,170,1)" size={16} />
      </View>
      <View
        style={{
          width: '70%',
          marginTop: 16,
        }}>
        <Text
          style={{
            textAlign: 'center',
            fontFamily: 'Graphik-Regular',
            fontSize: 16,
            lineHeight: 22,
            fontStyle: 'italic',
            color: 'rgba(0, 0, 0, 1)',
          }}>
          "{props.quote}”
        </Text>
      </View>
      <View
        style={{
          width: '90%',
          marginTop: 10,
        }}>
        <Text
          style={{
            textAlign: 'center',
            fontFamily: 'Graphik-Regular',
            fontSize: 15,
          }}>
          {props.author}
        </Text>
      </View>
    </View>
  );
}

function Header() {
  return (
    <View style={{width: '90%', alignSelf: 'center'}}>
      <Text
        style={{
          fontSize: 33,
          textAlign: 'left',
          marginBottom: 8,
          marginTop: screenHeight * 0.025,
          lineHeight: 36,
          letterSpacing: 0.5,
          color: 'rgba(0, 0, 0, 0.88)',
          fontFamily: 'Graphik-Medium',
        }}>
        ¡Es hora de facturar todos tus tickets!
      </Text>
      <Text
        style={{
          fontSize: 20,
          textAlign: 'left',
          marginBottom: 8,
          lineHeight: 28,
          fontFamily: 'Graphik-Regular',
          color: 'rgba(0, 0, 0, 0.65)',
        }}>
        Escoge un plan a tu medida para facturar todos tus tickets.
      </Text>
      <Text
        style={{
          fontSize: 20,
          textAlign: 'left',
          marginBottom: 12,
          lineHeight: 28,
          fontFamily: 'System',
          fontWeight: 'bold',
          color: 'rgba(0, 0, 0, 0.65)',
          textAlign: 'center',
        }}>
        ¡Primeros 7 días gratis!
      </Text>
    </View>
  );
}

export default function PaywallScreenV2(props) {
  const [selectedOption, setSelectedOption] = React.useState('individual');
  const [isPurchasingDisabled, setIsPurchasingDisabled] = React.useState(false);
  const [isPurchased, setIsPurchased] = React.useState(false);
  const scrollRef = React.useRef();

  // ahorro, individual, empresarial

  const selectedColor = 'rgba(96, 35, 209, 1)';
  const unselectColor = 'rgba(0,0,0,0.2)';
  const ahorroBorderColor =
    selectedOption === 'ahorro' ? selectedColor : unselectColor;
  const individualBorderColor =
    selectedOption === 'individual' ? selectedColor : unselectColor;
  const empresarialBorderColor =
    selectedOption === 'empresarial' ? selectedColor : unselectColor;
  const ahorroBorderWidth = selectedOption === 'ahorro' ? 2 : 2;
  const individualBorderWidth = selectedOption === 'individual' ? 2 : 2;
  const empresarialBorderWidth = selectedOption === 'empresarial' ? 2 : 2;

  const [fetchingProductData, setFetchingProductData] = React.useState(false);
  const mounted = React.useRef(false);
  const [ahorro_product, set_ahorro_product] = React.useState({});
  const [individual_product, set_individual_product] = React.useState({});
  const [empresarial_product, set_empresarial_product] = React.useState({});

  const PRODUCTS_ID = Platform.select({
    ios: [
      'fotofacturas_premium_ahorro',
      'fotofacturas_premium_individual',
      'fotofacturas_premium_empresarial',
    ],
    android: [
      'fotofacturas_premium_ahorro_ps',
      'fotofacturas_premium_individual_ps',
      'fotofacturas_premium_empresarial_ps',
    ], // TODO: Create new subscriptions plans on android
  });

  const selectedOptionToRCEntitlement = Platform.select({
    ios: {
      ahorro: 'entitlement_ahorro',
      individual: 'entitlement_individual',
      empresarial: 'entitlement_empresarial',
    },
    android: {
      ahorro: 'entitlement_ahorro',
      individual: 'entitlement_individual',
      empresarial: 'entitlement_empresarial',
    },
  });

  const selectedOptionToRCIdentifier = Platform.select({
    ios: {
      ahorro: 'fotofacturas_premium_ahorro',
      individual: 'fotofacturas_premium_individual',
      empresarial: 'fotofacturas_premium_empresarial',
    },
    android: {
      ahorro: 'fotofacturas_premium_ahorro_ps:ff-100-ahorro',
      individual: 'fotofacturas_premium_individual_ps:ff-299-individual-2024',
      empresarial:
        'fotofacturas_premium_empresarial_ps:ff-999-empresarial-2024',
    },
  });

  React.useEffect(() => {
    if (!isPurchased) return;
    setTimeout(() => {
      if (mounted.current) {
        // TODO: Uncomment
        // props.navigation.goBack();
      } else {
        console.log("PaywallScreen is unmounted, can't go back");
      }
    }, 3000);
  }, [isPurchased]);

  async function fetchProductsData() {
    try {
      var _products = await Purchases.getProducts(PRODUCTS_ID);
    } catch (e) {
      console.log('fetchProductsDataError', {e});
    }
    console.log({_products}, {PRODUCTS_ID});

    _products.forEach(product => {
      if (product.identifier === selectedOptionToRCIdentifier.ahorro) {
        set_ahorro_product(product);
        print('ahorr');
      } else if (
        product.identifier === selectedOptionToRCIdentifier.individual
      ) {
        set_individual_product(product);
      } else if (
        product.identifier === selectedOptionToRCIdentifier.empresarial
      ) {
        set_empresarial_product(product);
      }
    });
    setFetchingProductData(false);
  }

  React.useEffect(() => {
    (async () => {
      mounted.current = true;
      setFetchingProductData(true);

      // async wait 2 seconds inline one-liner
      //await new Promise(resolve => setTimeout(resolve, 5 * 1000));
      setTimeout(() => {
        scrollRef.current?.flashScrollIndicators();
      }, 100);

      fetchProductsData();
    })();

    return () => {
      mounted.current = false;
    };
  }, []);

  const handleRestoreSubscription = async function () {
    console.log('pressed restore');
    setIsPurchasingDisabled(true);

    try {
      const customerInfo = await Purchases.restorePurchases();
      console.log({customerInfoEntitlements: customerInfo.entitlements.active});

      const entitlements = Object.values(selectedOptionToRCEntitlement);
      let isPurchased = false;
      try {
        isPurchased = entitlements.some(
          entitlement => customerInfo.entitlements.active[entitlement],
        );
      } catch (e) {
        console.log({e});
      }

      if (isPurchased) {
        setIsPurchased(true);
      } else {
        throw new Error('No entitlements active');
      }
    } catch (e) {
      console.log('handleRestoreSubscription', {e});
      if (mounted.current) {
        Alert.alert(
          'Error',
          'No fue posible restaurar la compra. Intente subscribirse primero.',
        );
      }
    } finally {
      setIsPurchasingDisabled(false);
    }
  };

  const handlePurchaseSubscription = async function () {
    console.log('pressed purchase');
    setIsPurchasingDisabled(true);

    try {
      var purchase = {};
      if (selectedOption === 'ahorro') {
        // x: Code for 'ahorro' option
        console.log('Option selected: ahorro', {ahorro_product});
        purchase = await Purchases.purchaseStoreProduct(ahorro_product);
        console.log({purchase});
        // Add your code here for 'ahorro'
      } else if (selectedOption === 'individual') {
        // y: Code for 'individual' option
        console.log('Option selected: individual', {individual_product});
        purchase = await Purchases.purchaseStoreProduct(individual_product);
        console.log({purchase});
        // Add your code here for 'individual'
      } else if (selectedOption === 'empresarial') {
        // z: Code for 'empresarial' option
        console.log('Option selected: empresarial', {empresarial_product});
        purchase = await Purchases.purchaseStoreProduct(empresarial_product);
        console.log({purchase});
        // Add your code here for 'empresarial'
      }

      console.log('Checking for active_entitlements');
      const active_entitlements =
        purchase?.customerInfo?.entitlements?.active || {};
      if (
        typeof active_entitlements[
          selectedOptionToRCEntitlement[selectedOption]
        ] !== 'undefined'
      ) {
        console.log('purchased success');
        setIsPurchased(true);
      } else {
        throw new Error("Entitlement wasn't activated");
      }
    } catch (e) {
      console.log('handlePurchaseSubscription', {e});
      if (!e.userCancelled) {
        console.log({e});
        if (mounted.current) {
          Alert.alert(
            'Error',
            'No fue posible realizar la compra en este momento.',
          );
        }
      }
    }
    setIsPurchasingDisabled(false);
  };

  if (isPurchased) {
    return (
      <View
        style={{
          backgroundColor: '#4320C4',
          flex: 1,
          position: 'relative',
        }}>
        <StatusBar barStyle="light-content" />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 130,
            backgroundColor: 'transparent',
            opacity: 1,
            zIndex: 1,
          }}>
          <View
            style={{
              width: 120,
              height: 5,
              backgroundColor: 'black',
              borderRadius: 2.5,
              alignSelf: 'center',
              marginTop: 4,
              zIndex: 2,
            }}
          />
        </View>
        <ScrollView contentContainerStyle={{backgroundColor: 'white', flex: 1}}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              borderTopColor: '#CCCCCC',
              borderTopWidth: 0.66,
              backgroundColor: 'white',
            }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: 'bold',
                marginBottom: 8,
                marginTop: 32,
              }}>
              🎉
            </Text>
            <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 8}}>
              ¡Listo!
            </Text>
            <Text
              style={{
                fontSize: 24,
                marginBottom: 24,
                textAlign: 'center',
                paddingHorizontal: 48,
              }}>
              Puedes seguir facturando tus tickets.
            </Text>
            <TouchableOpacity
              style={{paddingVertical: 12, paddingHorizontal: 12}}
              onPress={() => props.navigation.goBack()}>
              <Text
                style={{
                  color: true
                    ? 'rgba(96, 35, 209, 1)'
                    : 'rgba(96, 35, 209, 0.85)',
                  fontSize: 19,
                  fontFamily: 'Graphik Medium',
                }}>
                Regresar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: '#4320C4',
        flex: 1,
        position: 'relative',
      }}>
      <StatusBar barStyle="light-content" />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          backgroundColor: 'transparent',
          opacity: 1,
          zIndex: 1,
        }}>
        <View
          style={{
            width: 120,
            height: 5,
            backgroundColor: 'black',
            borderRadius: 2.5,
            alignSelf: 'center',
            marginTop: 4,
            zIndex: 2,
          }}
        />
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{backgroundColor: 'white'}}
        showsVerticalScrollIndicator={true}>
        <View
          style={{
            backgroundColor: '#4320C4',
            height: screenHeight * 0.27,
          }}>
          <Image
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
              PaddingTop: 20,
            }}
            source={require('./../assets/paywall_hero9.jpg')}
          />
        </View>
        <Header />
        <View
          style={{
            paddingVertical: 10,
            flexDirection: 'row',
            overflow: 'hidden',
            width: screenWidth,
            paddingBottom: 18,
            paddingLeft: (screenWidth / 96) * 2.25,
            paddingRight: (screenWidth / 96) * 2.25,
          }}>
          <TouchableOpacity
            onPress={() => {
              setSelectedOption('ahorro');
            }}
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 16,
              paddingBottom: 18,
              paddingHorizontal: 2,
              borderColor: ahorroBorderColor,
              borderWidth: ahorroBorderWidth,
              borderRadius: 8,
              overflow: 'hidden',
              width: (screenWidth / 96) * 29.5,
              marginRight: (screenWidth / 96) * 1.5,
            }}>
            {fetchingProductData ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 20,
                }}>
                <ActivityIndicator size={'large'} />
              </View>
            ) : (
              <>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 28,
                    fontWeight: '600',
                    letterSpacing: -1.5,
                  }}>
                  {truncateWholePrices(ahorro_product.priceString)}{' '}
                  {ahorro_product.currencyCode === 'USD' ? 'USD' : ''}
                </Text>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 14.5,
                    fontFamily:
                      Platform.OS === 'ios' ? 'HelveticaNeue-Light' : 'Roboto',
                    letterSpacing: -0.5,
                  }}>
                  10 tickets<Text style={{letterSpacing: -2.25}}> </Text>
                  <Text style={{letterSpacing: -1.1}}>/ </Text>mes
                </Text>
              </>
            )}
          </TouchableOpacity>
          <View
            style={{
              position: 'absolute',
              backgroundColor: '#FD7167',
              padding: 4,
              paddingHorizontal: 7,
              borderRadius: 12,
              top: 0,
              left:
                (screenWidth / 96) * 33.25 +
                ((screenWidth / 96) * 29.5 - 90) / 2,
              zIndex: 1,
            }}>
            <Text
              style={{
                fontSize: 12,
                color: 'white',
                fontWeight: '500',
                fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                letterSpacing: -0.75,
              }}>
              MÁS<Text style={{letterSpacing: -0.25}}> </Text>POPULAR
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedOption('individual');
            }}
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 16,
              paddingBottom: 18,
              paddingHorizontal: 2,
              borderColor: individualBorderColor,
              borderWidth: individualBorderWidth,
              borderRadius: 8,
              backgroundColor: 'rgba(96, 35, 209, 0.02)',
              overflow: 'hidden',
              width: (screenWidth / 96) * 29.5,
              marginRight: (screenWidth / 96) * 1.5,
            }}>
            {/* 50% OFF / BEST DEAL */}
            {fetchingProductData ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 20,
                }}>
                <ActivityIndicator size={'large'} />
              </View>
            ) : (
              <>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 28,
                    fontWeight: '600',
                    letterSpacing: -1.5,
                  }}>
                  {truncateWholePrices(individual_product.priceString)}{' '}
                  {individual_product.currencyCode === 'USD' ? 'USD' : ''}
                </Text>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 14.5,
                    fontFamily:
                      Platform.OS === 'ios' ? 'HelveticaNeue-Light' : 'Roboto',
                    letterSpacing: -0.5,
                  }}>
                  60 tickets<Text style={{letterSpacing: -2.25}}> </Text>
                  <Text style={{letterSpacing: -1.1}}>/ </Text>mes
                </Text>
              </>
            )}
          </TouchableOpacity>
          <View
            style={{
              position: 'absolute',
              padding: 4,
              paddingHorizontal: 7,
              borderRadius: 12,
              bottom: -3.5,
              left:
                (screenWidth / 96) * 33.25 +
                ((screenWidth / 96) * 29.5 - 110) / 2,
              zIndex: 1,
            }}>
            <Text
              style={{
                fontSize: 12,
                color: 'rgba(96, 35, 209, 0.8)',
                fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                letterSpacing: -0.5,
                fontWeight: '600',
                fontStyle: 'italic',
              }}>
              <Text style={{letterSpacing: -1.2}}>¡ </Text>50% DESCUENTO
              <Text style={{letterSpacing: -1.3}}> !</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedOption('empresarial');
            }}
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 16,
              paddingBottom: 18,
              paddingHorizontal: 2,
              borderColor: empresarialBorderColor,
              borderWidth: empresarialBorderWidth,
              borderRadius: 8,
              overflow: 'hidden',
              width: (screenWidth / 96) * 29.5,
            }}>
            {fetchingProductData ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 20,
                }}>
                <ActivityIndicator size={'large'} />
              </View>
            ) : (
              <>
                <Text
                  style={{
                    marginLeft: -2,
                    textAlign: 'center',
                    fontSize: 28,
                    fontWeight: '600',
                    letterSpacing: -1.5,
                  }}>
                  {truncateWholePrices(empresarial_product.priceString)}{' '}
                  {empresarial_product.currencyCode === 'USD' ? 'USD' : ''}
                </Text>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 14.5,
                    fontFamily:
                      Platform.OS === 'ios' ? 'HelveticaNeue-Light' : 'Roboto',
                    letterSpacing: -0.5,
                  }}>
                  100 tickets<Text style={{letterSpacing: -2.25}}> </Text>
                  <Text style={{letterSpacing: -1.1}}>/ </Text>mes
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <VideoSection />
        <SellCopy />
        <View
          style={{
            marginBottom: -2,
          }}>
          <Text
            style={{
              textAlign: 'center',
              paddingHorizontal: 56,
              fontSize: 18,
              marginTop: 12,
              fontWeight: '600',
              fontSize: 30,
              fontFamily: 'Graphik-Regular',
              color: 'rgba(70, 35, 170, 1)',
            }}>
            1000+
          </Text>
          <Text
            style={{
              textAlign: 'center',
              paddingHorizontal: 58,
              fontSize: 20,
              marginTop: 6,
              fontFamily: 'Graphik-Regular',
              color: 'rgba(0, 0, 0, 0.65)',
              lineHeight: 26,
            }}>
            personas deduciendo impuestos con Fotofacturas
          </Text>
        </View>
        <Review
          quote="He perdido tantas horas buscando y facturando mis tickets. Ahora lo hago fácil con solo una foto."
          author="Juan Carlos. Emprendedor."
        />
        <Review
          quote="Mi jefa está muy contenta porque le facturó todo mucho más rápido, ya no se me pierde ningún ticket de gasto!"
          author="Zabdiel. Agente Inmobilario."
        />
        <Review
          quote="Estoy deduciendo miles de pesos en impuestos que antes pagaba al SAT. Ahora facturo todos los tickets desde los chiquitos hasta los grandes."
          author="Rebeca. Empresaria"
        />
        <View
          style={{
            marginTop: 24 + 12,
            marginBottom: 14,
            fontFamily: 'Graphik-Medium',
            fontSize: 26,
            width: '90%',
            alignSelf: 'center',
          }}>
          <Text
            style={{
              textAlign: 'left',
              fontSize: 26,
              fontWeight: '500',
              lineHeight: 28,
              letterSpacing: 0.5,
              fontFamily: 'Graphik-Medium',
            }}>
            Preguntas Frecuentes
          </Text>
        </View>
        <QA
          question="¿En cuánto tiempo recibo mi factura?"
          answer="Por lo general dentro de un rango de 24 horas. Contamos con procesos automatizados y otros manuales pero siempre damos prioridad a darte una solución a tiempo."
          closed={false}
        />
        <QA
          question="¿Cuántos tickets puedo facturar al mes?"
          answer="Los que indique tu plan. Ofrecemos planes para 10, 60 y 100 tickets de gastos mensuales. ¿Necesitas más tickets? Escríbenos por WhatsApp al número +52 55 2261 3142"
        />
        <QA
          question="¿Qué comercios puedo facturar?"
          answer="Aceptamos tickets de gasto de cualquier comercio Mexicano. Tickets de gasolinerías, de restaurantes, de tiendas comerciales y de todo tipo de comercio que te emita un comprobante o ticket recibo."
        />
        <QA
          question="¿Por qué nuestro precio?"
          answer="Nosotros sabemos que el tiempo de nuestros clientes vale oro. Nuestro servicio refleja ese valor. Además de ahorrar tu tiempo, nuestros clientes también terminan ahorrando más dinero al deducir todos sus gastos. El costo de esta suscripción es una inversión que regresa tu tiempo e impuestos."
        />
        <QA
          question="¿Cómo funciona realmente?"
          answer="Después de hacer una compra y subir tu ticket de gasto, nosotros nos encargamos de facturar tu ticket llueve, truene o relampagueé. Ya sea en un portal de facturación, correo electrónico o marcando directamente al negocio daremos seguimiento hasta tener una solución para ti."
        />
        <View style={{height: 156}} />
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: screenWidth * 2,
          backgroundColor: 'white',
          paddingBottom: screenHeight * 0.033,
          paddingTop: 16,
          shadowOffset: {
            width: -10,
            height: 10,
          },
          borderTopWidth: 0.33,
          borderTopColor: '#CCCCCC',
          shadowOpacity: 0.5,
          shadowRadius: 10,
        }}>
        <View
          style={{
            paddingHorizontal: 16,
            width: screenWidth,
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: isPurchasingDisabled
                ? 'rgba(96, 35, 209, 0.8)'
                : 'rgba(96, 35, 209, 1)',
              paddingHorizontal: 16,
              paddingVertical: 18,
              borderRadius: 8,
              width: 333,
            }}
            onPress={handlePurchaseSubscription}
            disabled={isPurchasingDisabled}>
            {isPurchasingDisabled ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 18,
                    color: 'white',
                    fontFamily: 'Graphik-Medium',
                    textAlign: 'center',
                  }}>
                  Comprar subscripción
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: 2,
              paddingTop: 12,
              paddingBottom: 8,
            }}
            onPress={handleRestoreSubscription}>
            <Text
              style={{
                color: isPurchasingDisabled
                  ? 'rgba(96, 35, 209, 1)'
                  : 'rgba(96, 35, 209, 0.85)',
                fontSize: 18,
                fontFamily: 'Graphik-Medium',
              }}>
              Restaurar Compra
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}