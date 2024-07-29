import { Carousel, CarouselSlide } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Card,
  Center,
  Chip,
  Container,
  Divider,
  Fieldset,
  Flex,
  Grid,
  GridCol,
  Group,
  Image,
  Input,
  NativeSelect,
  Overlay,
  Paper,
  SimpleGrid,
  Slider,
  Space,
  Stack,
  Switch,
  Text,
  TextInput,
  UnstyledButton,
  rgba,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { DatePickerInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";
import { IconBrandGithub, IconSearch } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import Header from "../components/Header/Header";
import HeaderHome from "../components/Header/HeaderHome";
import { motion as m } from "framer-motion";
import { whoAmI } from "../components/hooks/whoAmI";

const images = [
  "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-2.png",
  "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-3.png",
  "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png",
  "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-5.png",
  "https://placehold.co/600x400?text=Placeholder",
  "https://placehold.co/600x400?text=Placeholder",
  "https://placehold.co/600x400?text=Placeholder",
  "https://placehold.co/600x400?text=Placeholder",
];

function HomePage() {
  //all the carousell stuff make edits below to the key!
  const slides = images.map((url, index) => (
    <Carousel.Slide key={index}>
      <Image src={url} />
    </Carousel.Slide>
  ));

  const slides2 = images.map((url, index) => (
    <Carousel.Slide key={index}>
      <Card shadow="sm" padding="lg" radius="lg" withBorder w={450}>
        <Card.Section>
          <Image src={url} height={150}></Image>
        </Card.Section>
        <Text style={{ textAlign: "center" }}>Title</Text>
        <Text style={{ textAlign: "center" }}>Descripton</Text>
        <UnstyledButton style={{ textAlign: "center" }}>
          Check More Here
        </UnstyledButton>
      </Card>
    </Carousel.Slide>
  ));
  const autoplay = useRef(Autoplay({ delay: 10000 }));

  ///Explore Nearby Locations///
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState({});
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapRadius, setMapRadius] = useState(1000);

  const googleMarker = new google.maps.Marker({
    map: map,
    title: "Current Pinned Location",
    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  });
  //map initialization
  useEffect(() => {
    const mapOptions = {
      center: { lat: 1, lng: 100 },
      zoom: 15,
      mapId: import.meta.env.VITE_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    };

    const mapContainer = new google.maps.Map(
      mapRef.current as HTMLDivElement,
      mapOptions
    );
    setMap(mapContainer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation && map && googleMarker) {
      navigator.geolocation.getCurrentPosition((success) => {
        console.log("successful geolocation");
        const currentLoc = {
          lat: success.coords.latitude,
          lng: success.coords.longitude,
        };
        googleMarker.setPosition(currentLoc);
        map.setCenter(currentLoc);
        console.log(currentLoc);
        setCurrentLocation(currentLoc);
        console.log("curr loc state", currentLocation);
      });
    } else {
      console.log("unsuccecsful");
    }
  }, [map]);

  /////For NEARBY SEARCH SECTION///
  const [type, setType] = useState<string>();
  const [serviceOn, setServiceOn] =
    useState<google.maps.places.PlacesService>();

  const infowindow = new google.maps.InfoWindow();

  const [markerArray, setMarkerArray] = useState<google.maps.Marker[]>([]);

  function createMarker(place: google.maps.places.PlaceResult) {
    const marker = new google.maps.Marker({
      map,
      position: place.geometry?.location,
    });

    google.maps.event.addListener(marker, "click", () => {
      //console.log("is Info Window set?");
      infowindow.setContent(`
      <div style="text-align: center;">
      <img src=${
        place.photos && place.photos.length > 0
          ? place.photos[0].getUrl()
          : null
      } style="width: 100px; height: auto;"></img>
      <div>${
        place.rating
          ? '<text size="xs">Rating: ' + place.rating + "</text>"
          : null
      }</div>
      <div>${
        place.name ? '<text size="xs">' + place.name + "</text>" : ""
      }</div>
      <div>${
        place.opening_hours
          ? `<text>${
              place.opening_hours.open_now
                ? "Currently Open"
                : "Currently Closed"
            }</text>`
          : ""
      }</div>
    </div>
    `);

      infowindow.open(map, marker);
    });
    setMarkerArray((p) => [...p, marker]);
  }
  function apiRequest(type_to_find: string) {
    deleteMarker();
    console.log("current location api", currentLocation);
    const request = {
      location: currentLocation as google.maps.LatLng,
      radius: mapRadius,
      type: type_to_find,
    };
    return serviceOn?.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        //console.log("Results below");
        //console.log(results);
        results?.map((item) => {
          createMarker(item);
        });
      } else {
        console.log("nearby search is not working as expected");
      }
    });
  }

  function deleteMarker() {
    markerArray.forEach((item) => {
      item.setMap(null);
    });
    console.log("delete marker Array", markerArray);
    setMarkerArray([]);
  }

  useEffect(() => {
    if (type) {
      console.log("type is", type);
      if (mapRadius) {
        apiRequest(type);
      } else {
        apiRequest(type);
      }
    }
  }, [setType, type, mapRadius, setMapRadius]);

  useEffect(() => {
    if (map) {
      const service = new google.maps.places.PlacesService(map);
      setServiceOn(service);

      /*
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        console.log(results);
        results?.map((item) => {
          createMarker(item);
        });
      } else {
        console.log("nearby search is not working as expected");
      }
    });
    */
    }
  }, [map]);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      dateRange: [null, null],
    },
    validate: {
      name: (value) => (value.length > 0 ? null : " "),
      dateRange: (value) =>
        value[0] !== null && value[1] !== null ? null : " ",
    },
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const fetchUsername = async () => {
      const name = await whoAmI();
      setUsername(name);
    };

    fetchUsername();
  }, []);

  useEffect(() => {
    const authToken = sessionStorage.getItem(`authToken`);
    if (authToken) {
      setIsLoggedIn(true);
    }
    console.log("logged in?", isLoggedIn);
  });

  const navigate = useNavigate();

  return (
    <>
      <body>
        <Container fluid h={700} p="0">
          <m.div
            initial={{ opacity: 0.1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            exit={{ opacity: 1 }}
          >
            <Carousel plugins={[autoplay.current]}>
              <Carousel.Slide>
                <Image
                  h={700}
                  style={{ minWidth: 1200 }}
                  src="assets/japan-background-night.png"
                ></Image>
              </Carousel.Slide>
              <CarouselSlide>
                <Image
                  h={700}
                  style={{ minWidth: 1200 }}
                  src="assets/seoul.png"
                ></Image>
              </CarouselSlide>
              <CarouselSlide>
                <Image
                  h={700}
                  style={{ minWidth: 1200 }}
                  fallbackSrc="assets/sg.png"
                ></Image>
              </CarouselSlide>
            </Carousel>
          </m.div>
          <Overlay backgroundOpacity={0.35} h={700}>
            <HeaderHome />
            <Flex
              h={450}
              justify="flex-end"
              align="center"
              direction="column"
              mt={50}
            >
              <Center w={800} ml={27}>
                <Text
                  fw="bold"
                  style={{
                    fontFamily: "Roboto",
                    fontSize: "50px",
                    textShadow: "1.5px 2px 2px black",
                  }}
                  c="orange"
                >
                  Explore the World
                </Text>
                <Text
                  mt={6}
                  style={{
                    fontFamily: "Roboto",
                    fontSize: "50px",
                    textShadow: "1px 1px 1px black",
                  }}
                  c="white"
                  ml={13}
                >
                  with RoamGram.
                </Text>
              </Center>
              {!sessionStorage.getItem(`authToken`) ? (
                <Text
                  c="white"
                  style={{
                    fontFamily: "verdana",
                    // border: "2px white double",
                    borderBottom: "1px solid white",
                    borderTop: "1px solid white",
                    fontStyle: "bold",
                    padding: "10px",
                    fontSize: "25px",
                    fontWeight: "100",
                  }}
                >
                  Your All-in-One Travel Website
                </Text>
              ) : (
                <Text
                  c="white"
                  style={{
                    fontFamily: "verdana",
                    // border: "2px white double",
                    borderBottom: "1px solid white",
                    borderTop: "1px solid white",
                    fontStyle: "bold",
                    padding: "10px",
                    fontSize: "25px",
                    fontWeight: "100",
                  }}
                >
                  {`Welcome Back, ${username}!`}
                </Text>
              )}
              <Space h="60"></Space>
              <Container>
                <Stack align="center">
                  <Text
                    c="white"
                    style={{
                      fontSize: "18px",
                      fontFamily: "sans-serif",
                      backgroundColor: "rgba(192, 191, 192, 0.15)",
                      borderRadius: "300px",
                      padding: "3px",
                      paddingInline: "35px",
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    Create Your Journey
                  </Text>
                </Stack>
                <Center>
                  <Paper
                    c="white"
                    h={55}
                    w={800}
                    radius="lg"
                    shadow="xs"
                    mt={10}
                    mb={-20}
                  >
                    <form
                      onSubmit={form.onSubmit(
                        (values) => (
                          console.log(values, "values are"),
                          navigate("/travelPage"),
                          sessionStorage.setItem(
                            "HomePageTravel",
                            JSON.stringify(values)
                          )
                        )
                      )}
                    >
                      <Group align="center" justify="center" pt={8.5} pl={5}>
                        <TextInput
                          key={form.key("name")}
                          {...form.getInputProps("name")}
                          placeholder="Input Plan Name"
                          variant="unstyled"
                          styles={{
                            input: { fontSize: "16px" },
                          }}
                          h="auto"
                          w={255}
                        ></TextInput>
                        <Divider
                          mt={6}
                          orientation="vertical"
                          h={30}
                          color="steelblue"
                        ></Divider>
                        <DatePickerInput
                          key={form.key("dateRange")}
                          {...form.getInputProps("dateRange")}
                          variant="unstyled"
                          type="range"
                          placeholder="Input Date"
                          w={300}
                          h="auto"
                          styles={{
                            input: { fontSize: "16px" },
                          }}
                        ></DatePickerInput>

                        <Box>
                          <Button
                            className="home-submit"
                            type="submit"
                            variant="filled"
                            color="indigo"
                            style={{
                              fontSize: "16px",
                              width: "147px",
                            }}
                            radius="md"
                          >
                            Submit
                          </Button>
                        </Box>
                      </Group>
                    </form>
                  </Paper>
                </Center>
              </Container>
            </Flex>
          </Overlay>
        </Container>
        <Container fluid h={570} mt="50">
          <m.div
            initial={{ translateY: 40, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <SimpleGrid cols={2}>
              <Image
                h={79}
                w="auto"
                src="assets/Explore Nearby.png"
                ml={250}
                mt={32}
              ></Image>
              <Chip.Group
                onChange={(e) => {
                  setType(e as string);
                  //deleteMarker();
                  //apiRequest(e as string);
                }}
              >
                <Group mt={35} w={700}>
                  <Chip value="restaurant" variant="outline">
                    {" "}
                    Food{" "}
                  </Chip>
                  <Chip value="cafe" variant="outline">
                    Cafes
                  </Chip>
                  <Chip value="shopping_mall" variant="outline">
                    Mall
                  </Chip>
                  <Chip value="tourist_attraction" variant="outline">
                    Tourist attractions
                  </Chip>
                  <Chip value="night_club" variant="outline">
                    Clubs
                  </Chip>

                  <Chip value="supermarket" variant="outline">
                    Supermarket
                  </Chip>
                  <Chip value="parking" variant="outline">
                    Parking
                  </Chip>
                  <Chip value="atm" variant="outline">
                    ATM
                  </Chip>
                  <Text size="sm" c="gray" ff="monsteratt">
                    Explore Radius:{" "}
                  </Text>
                  <Slider
                    min={0}
                    max={5000}
                    color="red"
                    w={350}
                    size="xl"
                    step={100}
                    defaultValue={1000}
                    onChange={setMapRadius}
                    marks={[
                      { value: 0, label: "0" },
                      { value: 1000, label: "1000" },
                      { value: 3000, label: "3000" },
                      { value: 5000, label: "5000" },
                    ]}
                  ></Slider>
                </Group>
              </Chip.Group>
            </SimpleGrid>
          </m.div>
          {/* Put Map Here*/}
          <m.div
            initial={{ translateY: 40, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <Container
              className="map-container-home"
              ref={mapRef}
              fluid
              h={500}
              w={1390}
              mt={18}
              style={{ borderRadius: "20px" }}
            ></Container>
          </m.div>
        </Container>
        {/* <Container fluid h={350}>
          <Grid>
            <Grid.Col span={3}>
              <Image
                h={71}
                w="auto"
                src="assets/Guide.png"
                ml={250}
                mb={20}
              ></Image>
            </Grid.Col>
            <Grid.Col
              span="content"
              offset={3}
              style={{ alignContent: "center" }}
            >
              <Group gap="5em" mt={20}>
                <UnstyledButton>Nature</UnstyledButton>
                <UnstyledButton>Shopping</UnstyledButton>
                <UnstyledButton>Food</UnstyledButton>
                <UnstyledButton>Nightlife</UnstyledButton>
                <UnstyledButton>Travelling</UnstyledButton>
              </Group>
              <Divider mt={5} size="sm" color="black"></Divider>
            </Grid.Col>
          </Grid>

          <Container w={2000} fluid mt="25">
            <Carousel
              withIndicators
              slideSize="25%"
              slideGap="sm"
              loop
              align="start"
              slidesToScroll={4}
              plugins={[autoplay.current]}
            >
              {slides2}
            </Carousel>
          </Container>
        </Container> */}
      </body>
      <footer className="footer">
        <m.div
          initial={{ translateY: 40, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Divider
            labelPosition="center"
            label={
              <>
                <UnstyledButton
                  component="a"
                  href="https://github.com/kimseunghyun-kr/roamgram"
                >
                  <img height="50" src="/assets/github-mark.png"></img>
                </UnstyledButton>
              </>
            }
          ></Divider>
          <Stack align="center" mt={14}>
            <Text size="xs" c="gray">
              Tolentino Alexandra Morales and Kim Seung Hyun
            </Text>
            <Group>
              <Anchor href="https://github.com/Shiraishie">
                <Image
                  radius="xl"
                  src="https://github.com/Shiraishie.png"
                  w={40}
                />
              </Anchor>
              <Anchor href="https://github.com/kimseunghyun-kr">
                <Image
                  radius="xl"
                  src="https://github.com/kimseunghyun-kr.png"
                  w={40}
                />
              </Anchor>
            </Group>

            <Text size="xs" c="gray">
              Orbital 2024 - National University of Singapore
            </Text>
            <Space h={0}></Space>
          </Stack>
        </m.div>
      </footer>
    </>
  );
}

export default HomePage;
